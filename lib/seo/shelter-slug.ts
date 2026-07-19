import { slugify } from "@/lib/seo/slug"
import type { Shelter } from "@/lib/types/shelter.interface"

/**
 * Deterministic slug → shelter map for /shelters/[slug] URLs.
 *
 * Base slug is the shelter name; collisions disambiguate with the city slug,
 * then the id. Must always be built from the full shelter list so slugs stay
 * stable regardless of which shelter is being resolved.
 */
export function shelterSlugMap(shelters: Shelter[]): Map<string, Shelter> {
  const bySlug = new Map<string, Shelter>()
  const baseCounts = new Map<string, number>()

  for (const shelter of shelters) {
    const base = slugify(shelter.name ?? `shelter-${shelter.id}`)
    baseCounts.set(base, (baseCounts.get(base) ?? 0) + 1)
  }

  for (const shelter of shelters) {
    const base = slugify(shelter.name ?? `shelter-${shelter.id}`)
    let slug = base
    if ((baseCounts.get(base) ?? 0) > 1 && shelter.city) {
      slug = `${base}-${slugify(shelter.city)}`
    }
    if (bySlug.has(slug)) {
      slug = `${slug}-${shelter.id}`
    }
    bySlug.set(slug, shelter)
  }

  return bySlug
}

export function shelterSlugFor(shelter: Shelter, all: Shelter[]): string {
  for (const [slug, s] of shelterSlugMap(all)) {
    if (s.id === shelter.id) return slug
  }
  return slugify(shelter.name ?? `shelter-${shelter.id}`)
}
