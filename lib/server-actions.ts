"use server"

import { getExplorePage, type ExplorePage } from "@/lib/api/explore"
import type { ExploreFilters } from "@/lib/explore-filters"

/**
 * Server Action wrapper around the Explore data layer so the client component
 * can request pages without breaking the "use server" boundary. Filtering and
 * pagination run in memory over the cached live-pet index (see lib/api/explore).
 */
export async function fetchExplorePage(
  page: number,
  filters: ExploreFilters,
): Promise<ExplorePage> {
  return getExplorePage(page, filters)
}
