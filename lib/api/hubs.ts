import "server-only"

import { revalidateTag, unstable_cache } from "next/cache"
import { after } from "next/server"

import { getAllShelters } from "@/lib/api/shelters"
import { CACHE_TAGS, CACHE_TTL } from "@/lib/cache"
import {
  BREED_INDEX_THRESHOLD,
  breedSlug,
  normalizeBreed,
} from "@/lib/seo/breeds"
import { shelterSlugMap } from "@/lib/seo/shelter-slug"
import { slugify, titleCase } from "@/lib/seo/slug"
import { stateCodeFrom, stateNameFromCode } from "@/lib/seo/states"
import { isSupabaseConfigured, supabase } from "@/lib/supabase"
import { todayLocalISO } from "@/lib/today"
import type { Pet } from "@/lib/types/pet.interface"
import type { Shelter } from "@/lib/types/shelter.interface"

/** Days-until-deadline cutoff for "urgent" counts on hub pages. */
const URGENT_WINDOW_DAYS = 3

export interface LivePet extends Pet {
  shelter: Pick<
    Shelter,
    "id" | "name" | "city" | "state" | "latitude" | "longitude"
  > | null
}

// ---------------------------------------------------------------------------
// Live-pet index: one cached pets⋈shelters fetch powers every hub page,
// count, similar-pets block, and the sitemap, so they can never disagree.
// ---------------------------------------------------------------------------

async function fetchLivePets(): Promise<LivePet[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  const today = todayLocalISO()
  const PAGE_SIZE = 1000
  const pets: LivePet[] = []

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("pets")
      .select("*, shelters(id, name, city, state, latitude, longitude)")
      .gte("euthanasia_date", today)
      .order("euthanasia_date", { ascending: true })
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (error) {
      console.error("[api/hubs] fetchLivePets error:", error)
      return []
    }

    for (const row of data ?? []) {
      const { shelters, ...pet } = row as Pet & {
        shelters: LivePet["shelter"]
      }
      pets.push({ ...pet, shelter: shelters ?? null })
    }

    if (!data || data.length < PAGE_SIZE) {
      break
    }
  }

  return pets
}

const _getLivePetsCached = unstable_cache(fetchLivePets, ["hub-live-pets"], {
  tags: [CACHE_TAGS.pets],
  revalidate: CACHE_TTL.hubData,
})

export async function getLivePets(): Promise<LivePet[]> {
  const cached = await _getLivePetsCached()
  if (cached.length > 0) return cached

  const fresh = await fetchLivePets()
  if (fresh.length > 0) {
    after(() => {
      revalidateTag(CACHE_TAGS.pets, "max")
    })
  }
  return fresh
}

// ---------------------------------------------------------------------------
// Derived hub data (pure slicing of the cached index)
// ---------------------------------------------------------------------------

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  return Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  )
}

function countUrgent(pets: LivePet[]): number {
  return pets.filter((p) => {
    const days = daysUntil(p.euthanasia_date)
    return days !== null && days <= URGENT_WINDOW_DAYS
  }).length
}

function petStateCode(pet: LivePet): string | null {
  return stateCodeFrom(pet.shelter?.state ?? null)
}

function petCitySlug(pet: LivePet): string | null {
  return pet.shelter?.city ? slugify(pet.shelter.city) : null
}

export interface HubCity {
  slug: string
  name: string
  stateCode: string
  petCount: number
  shelterCount: number
}

export interface AdoptStateSummary {
  code: string
  name: string
  petCount: number
  shelterCount: number
  cities: HubCity[]
}

/**
 * States (with their cities) that have at least one shelter — the index for
 * /adopt, the state-hub city grids, and the sitemap's location URLs.
 */
export async function getAdoptIndexData(): Promise<AdoptStateSummary[]> {
  const [pets, shelters] = await Promise.all([getLivePets(), getAllShelters()])

  const states = new Map<string, AdoptStateSummary>()
  const cityIndex = new Map<string, HubCity>()

  for (const shelter of shelters) {
    const code = stateCodeFrom(shelter.state)
    if (!code || !shelter.city) continue
    const name = stateNameFromCode(code)
    if (!name) continue

    let state = states.get(code)
    if (!state) {
      state = { code, name, petCount: 0, shelterCount: 0, cities: [] }
      states.set(code, state)
    }
    state.shelterCount += 1

    const citySlug = slugify(shelter.city)
    const cityKey = `${code}/${citySlug}`
    let city = cityIndex.get(cityKey)
    if (!city) {
      city = {
        slug: citySlug,
        name: titleCase(shelter.city),
        stateCode: code,
        petCount: 0,
        shelterCount: 0,
      }
      cityIndex.set(cityKey, city)
      state.cities.push(city)
    }
    city.shelterCount += 1
  }

  for (const pet of pets) {
    const code = petStateCode(pet)
    if (!code) continue
    const state = states.get(code)
    if (!state) continue
    state.petCount += 1

    const citySlug = petCitySlug(pet)
    if (!citySlug) continue
    // A pet's joined shelter can name a city not present in the separately
    // cached shelters list — the two caches (hub-live-pets, shelters-all) have
    // independent TTLs and can drift between revalidations. Create the city on
    // demand instead of dereferencing a missing key (which crashed the page).
    const cityKey = `${code}/${citySlug}`
    let city = cityIndex.get(cityKey)
    if (!city) {
      city = {
        slug: citySlug,
        name: pet.shelter?.city ? titleCase(pet.shelter.city) : citySlug,
        stateCode: code,
        petCount: 0,
        shelterCount: 0,
      }
      cityIndex.set(cityKey, city)
      state.cities.push(city)
    }
    city.petCount += 1
  }

  const summaries = [...states.values()]
  summaries.sort((a, b) => b.petCount - a.petCount)
  for (const state of summaries) {
    state.cities.sort((a, b) => b.petCount - a.petCount)
  }
  return summaries
}

export interface StateHubData extends AdoptStateSummary {
  shelters: Shelter[]
  pets: LivePet[]
  urgentCount: number
  siblingStates: Array<{ code: string; name: string; petCount: number }>
}

export async function getStateHubData(
  stateCode: string,
): Promise<StateHubData | null> {
  const code = stateCode.toUpperCase()
  const [index, pets, shelters] = await Promise.all([
    getAdoptIndexData(),
    getLivePets(),
    getAllShelters(),
  ])

  const summary = index.find((s) => s.code === code)
  if (!summary) return null

  const statePets = pets.filter((p) => petStateCode(p) === code)
  return {
    ...summary,
    shelters: shelters.filter((s) => stateCodeFrom(s.state) === code),
    pets: statePets,
    urgentCount: countUrgent(statePets),
    siblingStates: index
      .filter((s) => s.code !== code)
      .map(({ code, name, petCount }) => ({ code, name, petCount })),
  }
}

export interface CityHubData {
  stateCode: string
  stateName: string
  citySlug: string
  cityName: string
  shelters: Shelter[]
  pets: LivePet[]
  urgentCount: number
  siblingCities: HubCity[]
}

export async function getCityHubData(
  stateCode: string,
  citySlug: string,
): Promise<CityHubData | null> {
  const code = stateCode.toUpperCase()
  const [index, pets, shelters] = await Promise.all([
    getAdoptIndexData(),
    getLivePets(),
    getAllShelters(),
  ])

  const state = index.find((s) => s.code === code)
  const city = state?.cities.find((c) => c.slug === citySlug)
  if (!state || !city) return null

  const cityPets = pets.filter(
    (p) => petStateCode(p) === code && petCitySlug(p) === citySlug,
  )
  return {
    stateCode: code,
    stateName: state.name,
    citySlug,
    cityName: city.name,
    shelters: shelters.filter(
      (s) =>
        stateCodeFrom(s.state) === code &&
        s.city != null &&
        slugify(s.city) === citySlug,
    ),
    pets: cityPets,
    urgentCount: countUrgent(cityPets),
    siblingCities: state.cities.filter((c) => c.slug !== citySlug),
  }
}

export interface ShelterHubData {
  shelter: Shelter
  slug: string
  stateCode: string | null
  stateName: string | null
  citySlug: string | null
  cityName: string | null
  pets: LivePet[]
  urgentCount: number
}

export async function getShelterHubData(
  slug: string,
): Promise<ShelterHubData | null> {
  const [pets, shelters] = await Promise.all([getLivePets(), getAllShelters()])

  const shelter = shelterSlugMap(shelters).get(slug)
  if (!shelter) return null

  const shelterPets = pets.filter((p) => p.shelter_id === shelter.id)
  const code = stateCodeFrom(shelter.state)
  return {
    shelter,
    slug,
    stateCode: code,
    stateName: code ? stateNameFromCode(code) : null,
    citySlug: shelter.city ? slugify(shelter.city) : null,
    cityName: shelter.city ? titleCase(shelter.city) : null,
    pets: shelterPets,
    urgentCount: countUrgent(shelterPets),
  }
}

/** slug → shelter for index pages and pet-page cross-links. */
export async function getShelterSlugs(): Promise<Map<string, Shelter>> {
  return shelterSlugMap(await getAllShelters())
}

export interface BreedSummary {
  name: string
  slug: string
  count: number
}

export interface BreedHubData extends BreedSummary {
  pets: LivePet[]
  urgentCount: number
  states: Array<{ code: string; name: string }>
}

function groupByBreed(pets: LivePet[]): Map<string, { name: string; pets: LivePet[] }> {
  const groups = new Map<string, { name: string; pets: LivePet[] }>()
  for (const pet of pets) {
    const name = normalizeBreed(pet.breed)
    if (!name) continue
    const slug = breedSlug(name)
    let group = groups.get(slug)
    if (!group) {
      group = { name, pets: [] }
      groups.set(slug, group)
    }
    group.pets.push(pet)
  }
  return groups
}

/**
 * Breeds with enough live pets to deserve an indexable page. Single source of
 * truth for both /breeds/[breed] 404-gating and the sitemap.
 */
export async function getIndexableBreeds(): Promise<BreedSummary[]> {
  const groups = groupByBreed(await getLivePets())
  return [...groups.entries()]
    .filter(([, g]) => g.pets.length >= BREED_INDEX_THRESHOLD)
    .map(([slug, g]) => ({ name: g.name, slug, count: g.pets.length }))
    .sort((a, b) => b.count - a.count)
}

export async function getBreedHubData(
  slug: string,
): Promise<BreedHubData | null> {
  const groups = groupByBreed(await getLivePets())
  const group = groups.get(slug)
  if (!group || group.pets.length < BREED_INDEX_THRESHOLD) return null

  const stateCodes = [
    ...new Set(
      group.pets
        .map((p) => petStateCode(p))
        .filter((code): code is string => code !== null),
    ),
  ]
  return {
    name: group.name,
    slug,
    count: group.pets.length,
    pets: group.pets,
    urgentCount: countUrgent(group.pets),
    states: stateCodes
      .map((code) => ({ code, name: stateNameFromCode(code)! }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  }
}

/**
 * Related pets for the pet detail page: same breed first, then same shelter,
 * then same state.
 */
export async function getSimilarPets(
  pet: Pet,
  limit = 4,
): Promise<LivePet[]> {
  const pets = await getLivePets()
  const breed = normalizeBreed(pet.breed)
  const shelter = pets.find((p) => p.id === pet.id)?.shelter ?? null
  const state = stateCodeFrom(shelter?.state ?? null)

  const score = (candidate: LivePet): number => {
    let s = 0
    if (breed && normalizeBreed(candidate.breed) === breed) s += 4
    if (pet.shelter_id != null && candidate.shelter_id === pet.shelter_id) s += 2
    if (state && petStateCode(candidate) === state) s += 1
    return s
  }

  return pets
    .filter((p) => p.id !== pet.id)
    .map((p) => ({ pet: p, score: score(p) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.pet)
}
