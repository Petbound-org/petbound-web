import "server-only"

import { getLivePets, type LivePet } from "@/lib/api/hubs"
import { breedSlug, normalizeBreed } from "@/lib/seo/breeds"
import {
  AGE_OPTIONS,
  GENDER_OPTIONS,
  SIZE_OPTIONS,
  type BreedOption,
  type ExploreFacets,
  type ExploreFilters,
} from "@/lib/explore-filters"
import { PETS_PER_PAGE } from "@/lib/pets-pagination"

/**
 * Explore browses the same cached live-pet index the hub pages use, filtering
 * and sorting in memory. This gives breed / age / size filters, real
 * distance-based location search, exact result counts, and pagination without
 * any database function — the geo RPC can't do breed filtering and uses fixed
 * coordinates. It also scopes Explore to currently at-risk pets (euthanasia
 * date not yet passed), consistent with the sitemap and hubs.
 */

const EARTH_RADIUS_MI = 3958.8

function haversineMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return EARTH_RADIUS_MI * 2 * Math.asin(Math.sqrt(a))
}

function distanceOf(
  pet: LivePet,
  lat: number,
  lon: number,
): number | null {
  const sLat = pet.shelter?.latitude
  const sLon = pet.shelter?.longitude
  if (sLat == null || sLon == null) return null
  return haversineMiles(lat, lon, sLat, sLon)
}

function applyFilters(pets: LivePet[], filters: ExploreFilters): LivePet[] {
  let result = pets

  if (filters.ages.length) {
    const set = new Set(filters.ages)
    result = result.filter((p) => p.age != null && set.has(p.age))
  }
  if (filters.sizes.length) {
    const set = new Set(filters.sizes)
    result = result.filter((p) => p.size != null && set.has(p.size))
  }
  if (filters.genders.length) {
    const set = new Set(filters.genders)
    result = result.filter((p) => p.gender != null && set.has(p.gender))
  }
  if (filters.breeds.length) {
    const set = new Set(filters.breeds)
    result = result.filter((p) => {
      const n = normalizeBreed(p.breed)
      return n != null && set.has(breedSlug(n))
    })
  }

  if (filters.coords) {
    const { lat, lon } = filters.coords
    const withDist = result.map((p) => ({ p, d: distanceOf(p, lat, lon) }))
    const radius = filters.radiusMiles
    const scoped =
      radius != null ? withDist.filter((x) => x.d != null && x.d <= radius) : withDist
    // Nearest first; pets whose shelter has no coordinates sink to the bottom.
    scoped.sort((a, b) => (a.d ?? Infinity) - (b.d ?? Infinity))
    return scoped.map((x) => x.p)
  }

  // Default sort: soonest euthanasia date first (most urgent).
  return [...result].sort((a, b) =>
    (a.euthanasia_date ?? "9999-12-31").localeCompare(
      b.euthanasia_date ?? "9999-12-31",
    ),
  )
}

export interface ExplorePage {
  pets: LivePet[]
  total: number
  totalPages: number
}

export async function getExplorePage(
  page: number,
  filters: ExploreFilters,
): Promise<ExplorePage> {
  const all = await getLivePets()
  const filtered = applyFilters(all, filters)
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / PETS_PER_PAGE))
  const safePage = Math.min(Math.max(page, 0), totalPages - 1)
  const start = safePage * PETS_PER_PAGE
  return {
    pets: filtered.slice(start, start + PETS_PER_PAGE),
    total,
    totalPages,
  }
}

/**
 * Facet values actually present among live pets, in canonical order. The UI
 * only renders age/size/gender chips for values that exist, so filters stay
 * clean while the scraper backfills fields (and light up once it does).
 */
export async function getExploreFacets(): Promise<ExploreFacets> {
  const all = await getLivePets()
  const ages = new Set<string>()
  const sizes = new Set<string>()
  const genders = new Set<string>()
  for (const pet of all) {
    if (pet.age) ages.add(pet.age)
    if (pet.size) sizes.add(pet.size)
    if (pet.gender) genders.add(pet.gender)
  }
  return {
    ages: AGE_OPTIONS.filter((a) => ages.has(a)),
    sizes: SIZE_OPTIONS.filter((s) => sizes.has(s)),
    genders: GENDER_OPTIONS.filter((g) => genders.has(g)),
  }
}

/** Distinct normalized breeds among live pets, most common first. */
export async function getExploreBreedOptions(): Promise<BreedOption[]> {
  const all = await getLivePets()
  const groups = new Map<string, { name: string; count: number }>()
  for (const pet of all) {
    const name = normalizeBreed(pet.breed)
    if (!name) continue
    const slug = breedSlug(name)
    const group = groups.get(slug)
    if (group) {
      group.count += 1
    } else {
      groups.set(slug, { name, count: 1 })
    }
  }
  return [...groups.entries()]
    .map(([slug, g]) => ({ slug, name: g.name, count: g.count }))
    .sort((a, b) => b.count - a.count)
}
