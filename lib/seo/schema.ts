import { BASE_URL } from "@/lib/seo/constants"
import type { Shelter } from "@/lib/types/shelter.interface"

/**
 * JSON-LD builders. All URLs must be absolute; relative hrefs are resolved
 * against BASE_URL.
 */

function absolute(href: string): string {
  return href.startsWith("http") ? href : `${BASE_URL}${href}`
}

export interface BreadcrumbItemInput {
  name: string
  /** Omit for the current page (last crumb). */
  href?: string
}

export function breadcrumbJsonLd(items: BreadcrumbItemInput[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.href ? { item: absolute(item.href) } : {}),
    })),
  }
}

export function itemListJsonLd(opts: { name: string; urls: string[] }): object {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: opts.name,
    numberOfItems: opts.urls.length,
    itemListElement: opts.urls.map((url, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absolute(url),
    })),
  }
}

export function collectionPageJsonLd(opts: {
  name: string
  description: string
  url: string
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: absolute(opts.url),
  }
}

export function animalShelterJsonLd(shelter: Shelter, url: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "AnimalShelter",
    name: shelter.name ?? "Animal Shelter",
    url: absolute(url),
    ...(shelter.address || shelter.city || shelter.state
      ? {
          address: {
            "@type": "PostalAddress",
            ...(shelter.address ? { streetAddress: shelter.address } : {}),
            ...(shelter.city ? { addressLocality: shelter.city } : {}),
            ...(shelter.state ? { addressRegion: shelter.state } : {}),
            addressCountry: "US",
          },
        }
      : {}),
    ...(shelter.phone_number ? { telephone: shelter.phone_number } : {}),
    ...(shelter.email ? { email: shelter.email } : {}),
    ...(shelter.latitude != null && shelter.longitude != null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: shelter.latitude,
            longitude: shelter.longitude,
          },
        }
      : {}),
  }
}
