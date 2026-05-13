/**
 * Centralized cache tags and TTLs.
 *
 * Tags allow us to invalidate groups of cached entries via
 * `revalidateTag()`. TTLs (in seconds) cap how long a cached entry
 * stays fresh before being recomputed on the next request.
 */

export const CACHE_TAGS = {
  pets: "pets",
  pet: (id: number | string) => `pet-${id}`,
  shelter: (id: number | string) => `shelter-${id}`,
} as const

export const CACHE_TTL = {
  /** Explore list — refreshed every 30 minutes. */
  petsList: 60 * 30,
  /** Pet detail — refreshed hourly. */
  petDetail: 60 * 60,
  /** Shelter detail — refreshed hourly. */
  shelterDetail: 60 * 60,
  /** Sitemap pet listing — refreshed daily. */
  sitemap: 60 * 60 * 24,
} as const
