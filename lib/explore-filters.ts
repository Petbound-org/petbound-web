/**
 * Shared filter definitions for the Explore page. Client-safe (no server-only
 * imports) so both the client UI and the server data layer can use them.
 */

// Canonical display order for facet chips. The scraper writes these exact
// values (see scraper.py AGE_MAP / SIZE_MAP / GENDER_MAP); the UI only renders
// a chip when the value is actually present in the current data.
export const AGE_OPTIONS = [
  "Under 6 months",
  "Young adult",
  "Adult",
  "Senior",
] as const
export const SIZE_OPTIONS = ["Small", "Medium", "Large", "X-Large"] as const
export const GENDER_OPTIONS = ["Male", "Female"] as const

export interface ExploreFilters {
  ages: string[]
  sizes: string[]
  genders: string[]
  /** Selected breed slugs (normalized), e.g. "labrador-retriever". */
  breeds: string[]
  /** Radius cap in miles; only applied when `coords` is set. */
  radiusMiles: number | null
  /** User geolocation, set when the visitor enables location search. */
  coords: { lat: number; lon: number } | null
}

export const DEFAULT_EXPLORE_FILTERS: ExploreFilters = {
  ages: [],
  sizes: [],
  genders: [],
  breeds: [],
  radiusMiles: null,
  coords: null,
}

export interface BreedOption {
  slug: string
  name: string
  count: number
}

/** Facet values actually present in the current data, in canonical order. */
export interface ExploreFacets {
  ages: string[]
  sizes: string[]
  genders: string[]
}
