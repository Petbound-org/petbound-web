import { slugify } from "@/lib/seo/slug"

/** Breeds with fewer live pets than this get no indexable page (hard 404). */
export const BREED_INDEX_THRESHOLD = 5

/**
 * Folds DB breed variants into one canonical display name, e.g.
 * "Labrador Retriever (mix breed)" → "Labrador Retriever".
 */
export function normalizeBreed(raw: string | null): string | null {
  if (!raw) return null
  const cleaned = raw
    .replace(/\s*\(mix[^)]*\)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim()
  return cleaned || null
}

export function breedSlug(normalized: string): string {
  return slugify(normalized)
}
