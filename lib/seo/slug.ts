/**
 * URL slug + display-name helpers for programmatic SEO pages.
 */

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/** Normalizes possibly ALL-CAPS DB strings ("LOS ANGELES" → "Los Angeles"). */
export function titleCase(input: string): string {
  return input
    .toLowerCase()
    .replace(/\b[a-z]/g, (c) => c.toUpperCase())
    .trim()
}
