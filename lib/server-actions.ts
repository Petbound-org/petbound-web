"use server"

import {
  getPets as getPetsCached,
  type PetListFilters,
} from "@/lib/api/pets"
import { PETS_PER_PAGE } from "@/lib/pets-pagination"
import type { PetFilters } from "@/components/ui/explore/filter-sidebar"
import type { Pet } from "@/lib/types/pet.interface"

function normalizePetFilters(filters: PetFilters): PetListFilters {
  return {
    ages: filters.ages?.length ? [...filters.ages] : undefined,
    sizes: filters.sizes?.length ? [...filters.sizes] : undefined,
  }
}

/**
 * Server Action wrapper around the cached pets list.
 *
 * The cached implementation lives in `lib/api/pets.ts`; this thin action
 * exists so the Explore client component can request additional pages
 * without breaking the "use server" boundary.
 */
export async function fetchPetsPage(
  page: number,
  filters: PetFilters,
): Promise<Pet[]> {
  return getPetsCached(page, normalizePetFilters(filters))
}

/**
 * Computes how many pages exist for the given filters (30 pets per page).
 * Uses exponential search + binary search on page indices — no extra DB
 * function required. Results are mostly served from the same `getPets` cache
 * as pagination.
 */
export async function resolveFilteredPetsTotalPages(
  filters: PetFilters,
): Promise<number> {
  const f = normalizePetFilters(filters)

  const first = await getPetsCached(0, f)
  if (first.length === 0) return 1
  if (first.length < PETS_PER_PAGE) return 1

  let low = 0
  let hi = 1

  while (true) {
    const chunk = await getPetsCached(hi, f)
    if (chunk.length === 0) {
      break
    }
    if (chunk.length < PETS_PER_PAGE) {
      return hi + 1
    }
    low = hi
    hi *= 2
    if (hi > 10_000) {
      break
    }
  }

  const atHi = await getPetsCached(hi, f)
  if (atHi.length > 0 && atHi.length < PETS_PER_PAGE) {
    return hi + 1
  }

  let left = low
  let right = hi - 1
  while (left < right) {
    const mid = Math.ceil((left + right) / 2)
    const d = await getPetsCached(mid, f)
    if (d.length === 0) {
      right = mid - 1
    } else {
      left = mid
    }
  }

  return left + 1
}
