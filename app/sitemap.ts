import type { MetadataRoute } from "next"

import { getPetSitemapEntries } from "@/lib/api/pets"

// Revalidate daily. Must be a literal for Next's segment config.
export const revalidate = 86400

const BASE_URL = "https://petbound.org"
const STATIC_PATHS = ["/", "/explore", "/about-us", "/saved"] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pets = await getPetSitemapEntries()

  const staticPages: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }))

  const petPages: MetadataRoute.Sitemap = pets.map((p) => ({
    url: `${BASE_URL}/pets/${p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: "daily",
    priority: 0.6,
  }))

  return [...staticPages, ...petPages]
}
