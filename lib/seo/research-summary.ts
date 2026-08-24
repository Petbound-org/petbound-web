import type { ResearchStats } from "@/lib/api/research"
import { formatDeadline } from "@/lib/seo/euthanasia"
import type { FaqItem } from "@/lib/seo/schema"

/**
 * Copy for the research report at /research/shelter-euthanasia-data.
 *
 * Same contract as lib/seo/shelter-summary.ts: every string here is rendered
 * verbatim on the page and reused in FAQPage markup. Google treats markup whose
 * answers are not visible as spam, so nothing may be written twice.
 *
 * Three rules govern the claims, and the third is the one that shapes the whole
 * report:
 *
 * 1. Never assert an outcome. There is no outcome column and the scraper never
 *    deletes, so a listing going quiet is indistinguishable from a euthanasia.
 *
 * 2. Attribute reasons to the shelters, not to us. `euthanasia_reason` is what
 *    the source published, not our assessment of the animal.
 *
 * 3. `update_db` upserts on (shelter_given_id, shelter_id), so `euthanasia_date`
 *    always holds the *most recent* date a shelter published while `created_at`
 *    holds when we first saw the listing. Their difference is therefore an upper
 *    bound on the notice a pet originally got, never the exact figure, and never
 *    proof that a date was extended: a large gap is equally consistent with a
 *    listing that simply appeared with a distant date. Claims phrased as "notice
 *    is at most N" are safe. Claims phrased as "shelters extended this date" are
 *    not, and must not appear here until the scraper records date changes.
 */

function fmt(n: number): string {
  return n.toLocaleString("en-US")
}

/** One decimal, with a bare integer when the decimal is zero. */
function pct(n: number): string {
  return `${Number.isInteger(n) ? n : n.toFixed(1)}%`
}

function reasonPct(stats: ResearchStats, label: string): number {
  return stats.reasons.find((r) => r.label === label)?.pct ?? 0
}

/** Human date for a YYYY-MM string, e.g. "2026-04" to "April 2026". */
export function monthLabel(month: string): string {
  const [year, m] = month.split("-").map(Number)
  return new Date(Date.UTC(year, m - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
}

/**
 * The lead answer, 40 to 60 words, verdict first. Extraction takes the first
 * passage under a matching heading, so this must open with the finding.
 *
 * Deliberately built on the lead-time distribution rather than on how far dates
 * sit past first sighting. Because the scraper overwrites the date in place, a
 * measured gap can only ever overstate the notice a pet originally had, which
 * makes "six days or less" a conservative claim that holds no matter how often
 * shelters revise. See rule 3 above.
 */
export function researchLeadAnswer(stats: ResearchStats): string {
  const { leadTime, coverage } = stats
  if (leadTime.sample === 0) {
    return "Petbound has not yet recorded enough listings to report on how much notice pets receive."
  }

  // Name the sample as what it is. It is slightly smaller than the total number
  // of listings, because rows missing either date are excluded, and two nearby
  // totals that differ by a few dozen read as an error unless the gap is named.
  return [
    `Very little.`,
    `Across the ${fmt(leadTime.sample)} listings carrying both a first-sighting and a scheduled date since ${coverage.firstSeen ? formatDeadline(coverage.firstSeen) : "late 2025"},`,
    `half had ${leadTime.median} days or less before the date their shelter had set,`,
    `and ${pct(leadTime.withinThreePct)} had three days or less.`,
    `Petbound stores only the most recent date a shelter published, so the real notice is likely shorter.`,
  ].join(" ")
}

/**
 * Meta description built from the lead answer, clipped to whole sentences.
 * Slicing at a character count leaves snippets ending mid-clause.
 */
export function researchMetaDescription(stats: ResearchStats): string {
  const text = researchLeadAnswer(stats)
  const max = 160
  if (text.length <= max) return text

  const sentences = text.match(/[^.]+\./g) ?? []
  let out = ""
  for (const sentence of sentences) {
    if ((out + sentence).length > max) break
    out += sentence
  }
  out = out.trim()
  if (out) return out

  const cut = text.slice(0, max)
  const lastSpace = cut.lastIndexOf(" ")
  return `${lastSpace > 0 ? cut.slice(0, lastSpace) : cut}...`
}

export function researchTitle(stats: ResearchStats): string {
  const { leadTime } = stats
  if (leadTime.sample === 0) return "Shelter Euthanasia Deadline Data"
  return `How Much Time Shelter Dogs on Euthanasia Lists Get: ${leadTime.median} Days`
}

/** Heading for the lead answer. Phrased the way the query is typed. */
export const LEAD_QUESTION =
  "How much notice does a dog on a shelter euthanasia list get?"

/**
 * Stable identity for each pair, so the page can attach the right table to the
 * right answer without depending on array order.
 */
export type ResearchFaqId =
  | "notice"
  | "finality"
  | "reasons"
  | "states"
  | "breeds"
  | "volume"
  | "source"

export interface ResearchFaq extends FaqItem {
  id: ResearchFaqId
}

/**
 * FAQ pairs rendered on the page and mirrored into FAQPage markup. The first
 * item is the lead answer, rendered above the fold rather than in the list, so
 * every answer still appears in the DOM exactly once.
 */
export function researchFaqItems(stats: ResearchStats): ResearchFaq[] {
  const { coverage, extension, states, breeds } = stats

  const topStates = states.slice(0, 3)
  const topBreeds = breeds.slice(0, 3)
  const spacePct = reasonPct(stats, "Lack of Space")
  const behaviorPct = reasonPct(stats, "Behavior")
  const medicalPct = reasonPct(stats, "Medical")

  const items: ResearchFaq[] = [
    {
      id: "notice",
      question: LEAD_QUESTION,
      answer: researchLeadAnswer(stats),
    },
    {
      id: "finality",
      question: "Does a scheduled euthanasia date mean the dog will be killed that day?",
      answer:
        `Petbound cannot tell you, and no source can from listing data alone. There is no outcome field in this data: ` +
        `a listing going quiet looks identical whether the pet was adopted, pulled by a rescue, given a later date, or euthanized. ` +
        `What the records do show is that ${fmt(extension.beyondThreshold)} of the ${fmt(extension.sample)} pets listed today ` +
        `carry a date more than ${extension.thresholdDays} days after we first saw them, so a listed date is not always final.`,
    },
    {
      id: "reasons",
      question: "Why are dogs put on shelter euthanasia lists?",
      answer:
        `Lack of space, overwhelmingly. It accounts for ${pct(spacePct)} of the ${fmt(coverage.totalListings)} listings Petbound has recorded, ` +
        `ahead of behavior at ${pct(behaviorPct)} and medical reasons at ${pct(medicalPct)}. ` +
        `These are the shelters' own stated reasons, copied from each listing. The dominant driver is shelter capacity rather than anything about the individual animal.`,
    },
    {
      id: "states",
      question: "Which states have the most dogs at risk?",
      answer:
        topStates.length > 0
          ? `${topStates[0].name} by a wide margin, at ${pct(topStates[0].pct)} of all ${fmt(coverage.totalListings)} listings Petbound has recorded. ` +
            `${topStates.slice(1).map((s) => `${s.name} at ${pct(s.pct)}`).join(", then ")} follow. ` +
            `Coverage spans ${coverage.stateCount} states and ${fmt(coverage.shelterCount)} shelters, so this reflects where Petbound collects rather than a national ranking.`
          : `Petbound has not yet recorded enough listings to break results down by state.`,
    },
    {
      id: "breeds",
      question: "Which breeds appear most often on euthanasia lists?",
      answer:
        topBreeds.length > 0
          ? `${topBreeds.map((b) => b.name).join(", ")} lead the current listings, with ${fmt(topBreeds[0].live)} ${topBreeds[0].name}s waiting right now. ` +
            `Petbound has recorded ${fmt(stats.distinctBreeds)} distinct breeds in total. ` +
            `Breed is taken from the shelter's own listing, and large working and bully breeds are consistently the most represented.`
          : `Petbound has not yet recorded enough current listings to break results down by breed.`,
    },
    {
      id: "volume",
      question: "How many dogs are added to shelter euthanasia lists each month?",
      answer:
        `Petbound records roughly ${fmt(monthlyTypical(stats))} new listings a month across the shelters it tracks, ` +
        `and ${fmt(coverage.liveListings)} pets are carrying an upcoming date right now. ` +
        `These are counts of listings, not of animals euthanized. Petbound has no way to measure outcomes and does not estimate them.`,
    },
    {
      id: "source",
      question: "Where does this data come from?",
      answer:
        `Every listing is collected daily from dogsindanger.com, which aggregates at-risk listings published by shelters themselves. ` +
        `Petbound has recorded ${fmt(coverage.totalListings)} of them since ${coverage.firstSeen ? formatDeadline(coverage.firstSeen) : "late 2025"}, ` +
        `covering ${fmt(coverage.shelterCount)} shelters across ${coverage.stateCount} states. Nothing is inferred or modelled: every figure is a count of published listings.`,
    },
  ]

  return items
}

/** Median monthly listing count, ignoring months with no collection at all. */
function monthlyTypical(stats: ResearchStats): number {
  const counts = stats.months
    .map((m) => m.listings)
    .filter((n) => n > 0)
    .sort((a, b) => a - b)
  if (counts.length === 0) return 0
  return counts[Math.floor(counts.length / 2)]
}

/**
 * Methodology prose. Rendered as its own section rather than a FAQ answer,
 * because the limitations need more room than a 60-word passage allows and
 * because a report whose caveats are buried is not one worth citing.
 */
export function researchLimitations(stats: ResearchStats): string[] {
  const { coverage, gapMonths } = stats
  const notes: string[] = [
    `Petbound records no outcomes. There is no field for what happened to a pet, and a listing disappearing from the source is indistinguishable from a euthanasia. Save rates, survival rates, and counts of animals euthanized cannot be derived from this data, and Petbound does not publish them.`,
    `Dates are upper bounds. Petbound stores the most recent date a shelter published for a pet, overwriting any earlier one. The interval between first sighting and that date can therefore only overstate the notice a pet originally received, never understate it.`,
    `First sighting is not intake. Timestamps record when a listing first reached Petbound, not when the animal entered the shelter.`,
    `Coverage is partial. ${fmt(coverage.shelterCount)} shelters across ${coverage.stateCount} states, all sourced from dogsindanger.com. This is not a national census, and states with more listings here may simply publish more.`,
  ]

  if (gapMonths.length > 0) {
    notes.push(
      `Collection gaps are excluded rather than shown as zero. ${gapMonths.map(monthLabel).join(", ")} ${gapMonths.length === 1 ? "has" : "have"} no records because collection stopped, not because listings stopped.`,
    )
  }

  notes.push(
    `A separate collection fault between July and August 2026 left name, age, gender, size, and description blank on new records until it was repaired. Breed, scheduled date, and stated reason were unaffected throughout, and every figure in this report rests on those three fields.`,
  )

  return notes
}
