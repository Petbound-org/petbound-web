import "server-only"

import {
  revalidateTag,
  unstable_cache,
  unstable_noStore as noStore,
} from "next/cache"
import { after } from "next/server"

import { PETS_PER_PAGE } from "@/lib/pets-pagination"
import { isSupabaseConfigured, supabase } from "@/lib/supabase"
import { CACHE_TAGS, CACHE_TTL } from "@/lib/cache"
import type { Pet } from "@/lib/types/pet.interface"

export { PETS_PER_PAGE }

/**
 * Coordinates used by the geo-RPCs for the "nearby pets" feeds.
 * Hard-coded for now; can be promoted to a request-scoped value later.
 */
const DEFAULT_LAT = 34.4208
const DEFAULT_LON = -119.6982

export interface PetListFilters {
  ages?: string[]
  sizes?: string[]
}

// ---------------------------------------------------------------------------
// Raw (uncached) fetchers
// ---------------------------------------------------------------------------

async function fetchPets(
  page: number,
  filters: PetListFilters,
): Promise<Pet[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  const ageFilters = filters.ages?.length ? filters.ages : null
  const sizeFilters = filters.sizes?.length ? filters.sizes : null

  const { data, error } = await supabase.rpc("get_nearby_pets_filtered", {
    user_lat: DEFAULT_LAT,
    user_lon: DEFAULT_LON,
    pet_limit: PETS_PER_PAGE,
    pet_offset: page * PETS_PER_PAGE,
    age_filters: ageFilters,
    size_filters: sizeFilters,
  })

  if (error) {
    console.error("[api/pets] fetchPets error:", error)
    return []
  }

  return (data ?? []) as Pet[]
}

async function fetchNearbyPets(count: number): Promise<Pet[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  const { data, error } = await supabase.rpc("get_nearby_pets", {
    user_lat: DEFAULT_LAT,
    user_lon: DEFAULT_LON,
    pet_limit: count,
  })

  if (error) {
    console.error("[api/pets] fetchNearbyPets error:", error)
    return []
  }

  return (data ?? []) as Pet[]
}

async function fetchPetById(id: number): Promise<Pet | null> {
  if (!isSupabaseConfigured()) {
    return null
  }

  const { data, error } = await supabase
    .from("pets")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("[api/pets] fetchPetById error:", error)
    return null
  }

  return (data as Pet) ?? null
}

async function fetchPetSitemapEntries(): Promise<
  Array<{ id: number; updated_at: string | null }>
> {
  if (!isSupabaseConfigured()) {
    return []
  }

  const primary = await supabase.from("pets").select("id, updated_at")

  if (!primary.error) {
    return (primary.data ?? []).map((row) => ({
      id: row.id as number,
      updated_at: (row as { updated_at: string | null }).updated_at ?? null,
    }))
  }

  if (primary.error.code === "42703") {
    const fallback = await supabase.from("pets").select("id")
    if (fallback.error) {
      console.error(
        "[api/pets] fetchPetSitemapEntries fallback error:",
        fallback.error,
      )
      return []
    }
    return (fallback.data ?? []).map((row) => ({
      id: row.id as number,
      updated_at: null,
    }))
  }

  console.error(
    "[api/pets] fetchPetSitemapEntries error:",
    primary.error,
  )
  return []
}

// ---------------------------------------------------------------------------
// Cached wrappers
//
// We never trust a cached *empty* list — empty almost always means the cache
// was populated during a transient outage or before data was seeded. We
// detect that case, refetch fresh, and bust the tag so subsequent requests
// hit the populated cache.
// ---------------------------------------------------------------------------

const _getPetsCached = unstable_cache(
  fetchPets,
  ["pets-list"],
  {
    tags: [CACHE_TAGS.pets],
    revalidate: CACHE_TTL.petsList,
  },
)

export async function getPets(
  page: number,
  filters: PetListFilters,
): Promise<Pet[]> {
  const cached = await _getPetsCached(page, filters)
  if (cached.length > 0) return cached

  const fresh = await fetchPets(page, filters)
  if (fresh.length > 0) {
    after(() => {
      revalidateTag(CACHE_TAGS.pets, "max")
    })
  }
  return fresh
}

/**
 * Homepage nearby grid: always live (no unstable_cache).
 * Empty lists must not stick behind a long TTL or static RSC cache so new pets
 * show up as soon as they exist.
 */
export async function getNearbyPets(count: number): Promise<Pet[]> {
  noStore()
  return fetchNearbyPets(count)
}

export const getPetById = unstable_cache(
  fetchPetById,
  ["pet-detail"],
  {
    tags: [CACHE_TAGS.pets],
    revalidate: CACHE_TTL.petDetail,
  },
)

const _getPetSitemapEntriesCached = unstable_cache(
  fetchPetSitemapEntries,
  ["pets-sitemap"],
  {
    tags: [CACHE_TAGS.pets],
    revalidate: CACHE_TTL.sitemap,
  },
)

export async function getPetSitemapEntries(): Promise<
  Array<{ id: number; updated_at: string | null }>
> {
  const cached = await _getPetSitemapEntriesCached()
  if (cached.length > 0) return cached

  const fresh = await fetchPetSitemapEntries()
  if (fresh.length > 0) {
    after(() => {
      revalidateTag(CACHE_TAGS.pets, "max")
    })
  }
  return fresh
}
