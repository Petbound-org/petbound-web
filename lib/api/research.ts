import "server-only"

import { revalidateTag, unstable_cache } from "next/cache"
import { after } from "next/server"

import { getAllShelters } from "@/lib/api/shelters"
import { CACHE_TAGS, CACHE_TTL } from "@/lib/cache"
import { normalizeBreed } from "@/lib/seo/breeds"
import { normalizeEuthanasiaReason } from "@/lib/seo/euthanasia"
import { slugify } from "@/lib/seo/slug"
import { stateCodeFrom, stateNameFromCode } from "@/lib/seo/states"
import { isSupabaseConfigured, supabase } from "@/lib/supabase"
import { todayLocalISO } from "@/lib/today"

/**
 * Aggregates over the *whole* pets table, live and historical, powering the
 * research report at /research/shelter-euthanasia-data.
 *
 * Every other bulk read in the app goes through getLivePets(), which filters to
 * `euthanasia_date >= today` and therefore sees roughly 6% of the table. The
 * report's entire premise is the part that filter throws away: how scheduled
 * dates move over time. So this is the one place that reads history.
 *
 * Two deliberate departures from the pattern in lib/api/hubs.ts:
 *
 * 1. `unstable_cache` wraps the *computed* aggregates, not the rows. Next caps a
 *    cache entry around 2MB and ~17k rows would strain it, while the stats
 *    object is a few KB. It also keeps the recompute off every request.
 * 2. The select is column-limited. `description` and `image_urls` are the wide
 *    columns and nothing here reads them.
 *
 * Nothing in this module may express an outcome. There is no outcome column in
 * the database and the scraper never deletes, so a listing going quiet is
 * indistinguishable from a euthanasia. Volume and scheduling are measurable;
 * survival is not.
 */

/** Rows carrying only what the aggregates need. */
interface ResearchRow {
  id: number
  breed: string | null
  euthanasia_date: string | null
  euthanasia_reason: string | null
  created_at: string | null
  shelter_id: number | null
}

/** Days a listing's scheduled date sits past the day we first recorded it. */
const EXTENDED_THRESHOLD_DAYS = 14

/** How many breeds the report names individually. */
const TOP_BREEDS = 8

export interface ReasonShare {
  label: string
  count: number
  pct: number
}

export interface StateShare {
  code: string
  name: string
  listings: number
  pct: number
  live: number
  shelters: number
}

export interface BreedShare {
  name: string
  live: number
}

export interface MonthVolume {
  /** YYYY-MM */
  month: string
  listings: number
}

export interface ResearchStats {
  /** YYYY-MM-DD the aggregates were computed. Feeds Article.dateModified. */
  generatedAt: string
  coverage: {
    totalListings: number
    liveListings: number
    shelterCount: number
    stateCount: number
    cityCount: number
    /** YYYY-MM-DD of the earliest and latest first-seen timestamps. */
    firstSeen: string | null
    lastSeen: string | null
  }
  /** Evidence that scheduled dates move. Measured on currently-listed pets. */
  extension: {
    sample: number
    beyondThreshold: number
    beyondThresholdPct: number
    thresholdDays: number
    maxDays: number
    medianDays: number
  }
  /** Notice between first sighting and the scheduled date, across all history. */
  leadTime: {
    sample: number
    median: number
    p25: number
    p75: number
    withinThree: number
    withinThreePct: number
    withinSeven: number
    withinSevenPct: number
  }
  reasons: ReasonShare[]
  states: StateShare[]
  breeds: BreedShare[]
  distinctBreeds: number
  months: MonthVolume[]
  /** Months inside the observed range with zero listings, i.e. collection gaps. */
  gapMonths: string[]
}

const EMPTY_STATS: ResearchStats = {
  generatedAt: "",
  coverage: {
    totalListings: 0,
    liveListings: 0,
    shelterCount: 0,
    stateCount: 0,
    cityCount: 0,
    firstSeen: null,
    lastSeen: null,
  },
  extension: {
    sample: 0,
    beyondThreshold: 0,
    beyondThresholdPct: 0,
    thresholdDays: EXTENDED_THRESHOLD_DAYS,
    maxDays: 0,
    medianDays: 0,
  },
  leadTime: {
    sample: 0,
    median: 0,
    p25: 0,
    p75: 0,
    withinThree: 0,
    withinThreePct: 0,
    withinSeven: 0,
    withinSevenPct: 0,
  },
  reasons: [],
  states: [],
  breeds: [],
  distinctBreeds: 0,
  months: [],
  gapMonths: [],
}

// ---------------------------------------------------------------------------
// Small statistics helpers. The repo has no stats module; these are only used
// here, so they stay private rather than becoming shared surface.
// ---------------------------------------------------------------------------

/** Nearest-rank percentile over an ascending-sorted array. */
function percentile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0
  const index = Math.min(sorted.length - 1, Math.floor(sorted.length * q))
  return sorted[index]
}

function share(count: number, total: number): number {
  if (total === 0) return 0
  return Math.round((count / total) * 1000) / 10
}

/** Whole days between two date-only strings, both parsed as UTC midnight. */
function daysBetween(fromISO: string, toISO: string): number | null {
  const from = Date.parse(`${fromISO}T00:00:00Z`)
  const to = Date.parse(`${toISO}T00:00:00Z`)
  if (Number.isNaN(from) || Number.isNaN(to)) return null
  return Math.round((to - from) / 86_400_000)
}

/** created_at is a timestamp; the date half is what all day arithmetic uses. */
function firstSeenDate(row: ResearchRow): string | null {
  return row.created_at ? row.created_at.slice(0, 10) : null
}

/**
 * Every YYYY-MM from `start` to `end` inclusive, so a month with no rows shows
 * up as a gap rather than silently vanishing from the series.
 */
function monthRange(start: string, end: string): string[] {
  const months: string[] = []
  let [year, month] = start.split("-").map(Number)
  const [endYear, endMonth] = end.split("-").map(Number)
  while (year < endYear || (year === endYear && month <= endMonth)) {
    months.push(`${year}-${String(month).padStart(2, "0")}`)
    month += 1
    if (month > 12) {
      month = 1
      year += 1
    }
  }
  return months
}

// ---------------------------------------------------------------------------
// Fetch + compute
// ---------------------------------------------------------------------------

async function fetchAllRows(): Promise<ResearchRow[]> {
  const PAGE_SIZE = 1000
  const rows: ResearchRow[] = []

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("pets")
      .select("id, breed, euthanasia_date, euthanasia_reason, created_at, shelter_id")
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (error) {
      console.error("[api/research] fetchAllRows error:", error)
      return []
    }

    rows.push(...((data ?? []) as ResearchRow[]))
    if (!data || data.length < PAGE_SIZE) break
  }

  return rows
}

async function computeResearchStats(): Promise<ResearchStats> {
  if (!isSupabaseConfigured()) {
    return EMPTY_STATS
  }

  const [rows, shelters] = await Promise.all([fetchAllRows(), getAllShelters()])
  if (rows.length === 0) {
    return EMPTY_STATS
  }

  const today = todayLocalISO()
  const shelterById = new Map(shelters.map((s) => [s.id, s]))

  // --- coverage -----------------------------------------------------------
  const firstSeenDates = rows
    .map(firstSeenDate)
    .filter((d): d is string => d !== null)
    .sort()

  const liveRows = rows.filter(
    (r) => r.euthanasia_date != null && r.euthanasia_date >= today,
  )

  const cityKeys = new Set<string>()
  for (const shelter of shelters) {
    const code = stateCodeFrom(shelter.state)
    if (!code || !shelter.city?.trim()) continue
    cityKeys.add(`${code}/${slugify(shelter.city)}`)
  }

  // --- reasons ------------------------------------------------------------
  // A handful of rows carry parse debris from past scraper breakages ("read the
  // success story", a stray date). Anything outside the shelters' own vocabulary
  // is folded into Other rather than rendered as its own category.
  const KNOWN_REASONS = new Set([
    "Lack of Space",
    "Behavior",
    "Medical",
    "Age",
    "Other",
  ])
  const reasonCounts = new Map<string, number>()
  for (const row of rows) {
    const normalized = normalizeEuthanasiaReason(row.euthanasia_reason)
    const label = normalized && KNOWN_REASONS.has(normalized) ? normalized : "Other"
    reasonCounts.set(label, (reasonCounts.get(label) ?? 0) + 1)
  }
  const reasons: ReasonShare[] = [...reasonCounts.entries()]
    .map(([label, count]) => ({ label, count, pct: share(count, rows.length) }))
    .sort((a, b) => b.count - a.count)

  // --- geography ----------------------------------------------------------
  const stateAgg = new Map<
    string,
    { listings: number; live: number; shelters: number }
  >()
  const bump = (code: string, key: "listings" | "live" | "shelters") => {
    let entry = stateAgg.get(code)
    if (!entry) {
      entry = { listings: 0, live: 0, shelters: 0 }
      stateAgg.set(code, entry)
    }
    entry[key] += 1
  }
  for (const row of rows) {
    const code = stateCodeFrom(
      row.shelter_id != null ? (shelterById.get(row.shelter_id)?.state ?? null) : null,
    )
    if (code) bump(code, "listings")
  }
  for (const row of liveRows) {
    const code = stateCodeFrom(
      row.shelter_id != null ? (shelterById.get(row.shelter_id)?.state ?? null) : null,
    )
    if (code) bump(code, "live")
  }
  for (const shelter of shelters) {
    const code = stateCodeFrom(shelter.state)
    if (code) bump(code, "shelters")
  }
  const states: StateShare[] = [...stateAgg.entries()]
    .map(([code, entry]) => ({
      code,
      name: stateNameFromCode(code) ?? code,
      listings: entry.listings,
      pct: share(entry.listings, rows.length),
      live: entry.live,
      shelters: entry.shelters,
    }))
    .sort((a, b) => b.listings - a.listings)

  // --- lead time ----------------------------------------------------------
  // Notice between the day a listing first appeared to us and the date the
  // shelter scheduled. Rows whose scheduled date precedes first sighting are
  // excluded: a negative notice is a source-side artefact, not a measurement.
  const leads: number[] = []
  for (const row of rows) {
    const seen = firstSeenDate(row)
    if (!seen || !row.euthanasia_date) continue
    const days = daysBetween(seen, row.euthanasia_date)
    if (days === null || days < 0) continue
    leads.push(days)
  }
  leads.sort((a, b) => a - b)
  const withinThree = leads.filter((d) => d <= 3).length
  const withinSeven = leads.filter((d) => d <= 7).length

  // --- date extension (live only) -----------------------------------------
  const liveLeads: number[] = []
  for (const row of liveRows) {
    const seen = firstSeenDate(row)
    if (!seen || !row.euthanasia_date) continue
    const days = daysBetween(seen, row.euthanasia_date)
    if (days === null || days < 0) continue
    liveLeads.push(days)
  }
  liveLeads.sort((a, b) => a - b)
  const beyondThreshold = liveLeads.filter(
    (d) => d > EXTENDED_THRESHOLD_DAYS,
  ).length

  // --- breeds -------------------------------------------------------------
  const liveBreedCounts = new Map<string, number>()
  for (const row of liveRows) {
    const name = normalizeBreed(row.breed)
    if (!name) continue
    liveBreedCounts.set(name, (liveBreedCounts.get(name) ?? 0) + 1)
  }
  const breeds: BreedShare[] = [...liveBreedCounts.entries()]
    .map(([name, live]) => ({ name, live }))
    .sort((a, b) => b.live - a.live)
    .slice(0, TOP_BREEDS)

  const distinctBreeds = new Set(
    rows.map((r) => normalizeBreed(r.breed)).filter((b): b is string => b !== null),
  ).size

  // --- monthly volume -----------------------------------------------------
  const monthCounts = new Map<string, number>()
  for (const row of rows) {
    const seen = firstSeenDate(row)
    if (!seen) continue
    const month = seen.slice(0, 7)
    monthCounts.set(month, (monthCounts.get(month) ?? 0) + 1)
  }
  const observed = [...monthCounts.keys()].sort()
  const months: MonthVolume[] =
    observed.length > 0
      ? monthRange(observed[0], observed[observed.length - 1]).map((month) => ({
          month,
          listings: monthCounts.get(month) ?? 0,
        }))
      : []
  const gapMonths = months.filter((m) => m.listings === 0).map((m) => m.month)

  return {
    generatedAt: today,
    coverage: {
      totalListings: rows.length,
      liveListings: liveRows.length,
      shelterCount: shelters.length,
      stateCount: stateAgg.size,
      cityCount: cityKeys.size,
      firstSeen: firstSeenDates[0] ?? null,
      lastSeen: firstSeenDates[firstSeenDates.length - 1] ?? null,
    },
    extension: {
      sample: liveLeads.length,
      beyondThreshold,
      beyondThresholdPct: share(beyondThreshold, liveLeads.length),
      thresholdDays: EXTENDED_THRESHOLD_DAYS,
      maxDays: liveLeads[liveLeads.length - 1] ?? 0,
      medianDays: percentile(liveLeads, 0.5),
    },
    leadTime: {
      sample: leads.length,
      median: percentile(leads, 0.5),
      p25: percentile(leads, 0.25),
      p75: percentile(leads, 0.75),
      withinThree,
      withinThreePct: share(withinThree, leads.length),
      withinSeven,
      withinSevenPct: share(withinSeven, leads.length),
    },
    reasons,
    states,
    breeds,
    distinctBreeds,
    months,
    gapMonths,
  }
}

const _getResearchStatsCached = unstable_cache(
  computeResearchStats,
  ["research-stats"],
  {
    tags: [CACHE_TAGS.pets],
    revalidate: CACHE_TTL.researchData,
  },
)

/**
 * Cached aggregates for the research report. Mirrors the empty-result bypass
 * used by getLivePets() and getAllShelters(): a cached zero is never trusted,
 * because it means the fetch failed rather than that the table is empty.
 */
export async function getResearchStats(): Promise<ResearchStats> {
  const cached = await _getResearchStatsCached()
  if (cached.coverage.totalListings > 0) return cached

  const fresh = await computeResearchStats()
  if (fresh.coverage.totalListings > 0) {
    after(() => {
      revalidateTag(CACHE_TAGS.pets, "max")
    })
  }
  return fresh
}
