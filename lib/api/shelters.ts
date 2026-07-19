import "server-only"

import { revalidateTag, unstable_cache } from "next/cache"
import { after } from "next/server"

import { isSupabaseConfigured, supabase } from "@/lib/supabase"
import { CACHE_TAGS, CACHE_TTL } from "@/lib/cache"
import type { Shelter } from "@/lib/types/shelter.interface"

async function fetchShelterById(id: number): Promise<Shelter | null> {
  if (!isSupabaseConfigured()) {
    return null
  }

  const { data, error } = await supabase
    .from("shelters")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("[api/shelters] getShelterById error:", error)
    return null
  }

  return (data as Shelter) ?? null
}

/**
 * Cached single-shelter lookup used by the pet detail page.
 */
export const getShelterById = unstable_cache(
  fetchShelterById,
  ["shelter-detail"],
  {
    tags: [CACHE_TAGS.pets],
    revalidate: CACHE_TTL.shelterDetail,
  },
)

async function fetchAllShelters(): Promise<Shelter[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  const { data, error } = await supabase
    .from("shelters")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    console.error("[api/shelters] fetchAllShelters error:", error)
    return []
  }

  return (data ?? []) as Shelter[]
}

const _getAllSheltersCached = unstable_cache(
  fetchAllShelters,
  ["shelters-all"],
  {
    tags: [CACHE_TAGS.pets],
    revalidate: CACHE_TTL.sheltersList,
  },
)

/**
 * Full shelter list for hub pages, slugs, and the sitemap. Mirrors the
 * empty-result bypass in lib/api/pets.ts: a cached empty list is never
 * trusted — refetch and bust the tag so the populated result sticks.
 */
export async function getAllShelters(): Promise<Shelter[]> {
  const cached = await _getAllSheltersCached()
  if (cached.length > 0) return cached

  const fresh = await fetchAllShelters()
  if (fresh.length > 0) {
    after(() => {
      revalidateTag(CACHE_TAGS.pets, "max")
    })
  }
  return fresh
}
