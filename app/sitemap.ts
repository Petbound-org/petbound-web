import type { MetadataRoute } from "next"

import {
  getAdoptIndexData,
  getIndexableBreeds,
  getShelterSlugs,
} from "@/lib/api/hubs"
import { getPetSitemapEntries } from "@/lib/api/pets"
import { BASE_URL } from "@/lib/seo/constants"

// Revalidate daily. Must be a literal for Next's segment config.
export const revalidate = 86400

// /saved is intentionally excluded: it's a noindex, device-local page.
const STATIC_PATHS = ["/", "/explore", "/about-us"] as const

function entry(
  path: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "daily",
): MetadataRoute.Sitemap[number] {
  return {
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pets, adoptIndex, breeds, shelterSlugs] = await Promise.all([
    getPetSitemapEntries(),
    getAdoptIndexData(),
    getIndexableBreeds(),
    getShelterSlugs(),
  ])

  const staticPages: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }))

  // Evergreen hub pages: locations, shelters, breeds. Thin breeds are already
  // excluded by getIndexableBreeds — the same source their pages 404 from.
  const hubPages: MetadataRoute.Sitemap = [
    entry("/adopt", 0.8),
    ...adoptIndex.flatMap((state) => {
      const statePath = `/adopt/${state.code.toLowerCase()}`
      return [
        entry(statePath, 0.8),
        ...state.cities.map((city) => entry(`${statePath}/${city.slug}`, 0.7)),
      ]
    }),
    entry("/shelters", 0.5, "weekly"),
    ...[...shelterSlugs.keys()].map((slug) =>
      entry(`/shelters/${slug}`, 0.6),
    ),
    entry("/breeds", 0.6),
    ...breeds.map((breed) => entry(`/breeds/${breed.slug}`, 0.7)),
  ]

  const petPages: MetadataRoute.Sitemap = pets.map((p) => ({
    url: `${BASE_URL}/pets/${p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: "daily",
    priority: 0.6,
  }))

  return [...staticPages, ...hubPages, ...petPages]
}
