import "server-only"

import { unstable_cache } from "next/cache"

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
