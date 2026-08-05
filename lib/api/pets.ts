import "server-only"

import {
  revalidateTag,
  unstable_cache,
  unstable_noStore as noStore,
} from "next/cache"
import { after } from "next/server"

import { isSupabaseConfigured, supabase } from "@/lib/supabase"
import { CACHE_TAGS, CACHE_TTL } from "@/lib/cache"
import { todayLocalISO } from "@/lib/today"
import type { Pet } from "@/lib/types/pet.interface"

/**
 * Coordinates used by the geo-RPC for the homepage "nearby pets" feed.
 * Hard-coded for now; can be promoted to a request-scoped value later.
 */
const DEFAULT_LAT = 34.4208
const DEFAULT_LON = -119.6982

// ---------------------------------------------------------------------------
// Raw (uncached) fetchers
// ---------------------------------------------------------------------------

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

  // Only currently listed pets (euthanasia date not yet passed) belong in the
  // sitemap; the table retains past listings. Supabase caps responses at
  // 1,000 rows per request, so page until a short page.
  const today = todayLocalISO()
  const PAGE_SIZE = 1000
  const entries: Array<{ id: number; updated_at: string | null }> = []

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("pets")
      .select("id, updated_at")
      .gte("euthanasia_date", today)
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (error) {
      console.error("[api/pets] fetchPetSitemapEntries error:", error)
      return []
    }

    for (const row of data ?? []) {
      entries.push({
        id: row.id as number,
        updated_at: (row as { updated_at: string | null }).updated_at ?? null,
      })
    }

    if (!data || data.length < PAGE_SIZE) {
      break
    }
  }

  return entries
}

// ---------------------------------------------------------------------------
// Cached wrappers
//
// We never trust a cached *empty* list — empty almost always means the cache
// was populated during a transient outage or before data was seeded. We
// detect that case, refetch fresh, and bust the tag so subsequent requests
// hit the populated cache.
// ---------------------------------------------------------------------------

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
