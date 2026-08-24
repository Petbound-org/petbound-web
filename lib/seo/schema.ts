import { BASE_URL } from "@/lib/seo/constants"
import type { Shelter } from "@/lib/types/shelter.interface"

/**
 * JSON-LD builders. All URLs must be absolute; relative hrefs are resolved
 * against BASE_URL.
 */

function absolute(href: string): string {
  return href.startsWith("http") ? href : `${BASE_URL}${href}`
}

/**
 * Stable node id for the publisher.
 *
 * The root layout emits the full NGO node under this id; everything else refers
 * to it by reference instead of restating name, logo and contact details. That
 * gives crawlers and AI systems one organization to resolve rather than several
 * look-alike copies to reconcile.
 */
export const ORGANIZATION_ID = `${BASE_URL}/#organization`

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

export interface FaqItem {
  question: string
  /** Plain text. Rendered answers must match this, or the markup is spam. */
  answer: string
}

/**
 * FAQPage markup. Google requires the answers here to be visible on the page,
 * so build this from the same strings the component renders, never from a
 * separate copy written for crawlers.
 */
export function faqPageJsonLd(items: FaqItem[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }
}

export interface DatasetInput {
  name: string
  description: string
  url: string
  /** ISO 8601 interval, e.g. "2025-11-09/2026-08-23". */
  temporalCoverage?: string
  /** Plain-language names of the fields the dataset holds. */
  variableMeasured?: string[]
  /** Where the underlying records were published, e.g. the source site. */
  isBasedOn?: string
  /** YYYY-MM-DD. */
  dateModified?: string
  keywords?: string[]
}

/**
 * Dataset markup for the research report.
 *
 * Declares the aggregate as a citable dataset rather than an article about one.
 * `creator` and `publisher` point at the shared organization node so the report
 * and the site resolve to the same entity.
 */
export function datasetJsonLd(opts: DatasetInput): object {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: opts.name,
    description: opts.description,
    url: absolute(opts.url),
    creator: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    isAccessibleForFree: true,
    ...(opts.temporalCoverage ? { temporalCoverage: opts.temporalCoverage } : {}),
    ...(opts.variableMeasured ? { variableMeasured: opts.variableMeasured } : {}),
    ...(opts.isBasedOn ? { isBasedOn: opts.isBasedOn } : {}),
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
    ...(opts.keywords ? { keywords: opts.keywords } : {}),
  }
}

export interface ArticleInput {
  headline: string
  description: string
  url: string
  /** YYYY-MM-DD. */
  datePublished: string
  /** YYYY-MM-DD. */
  dateModified: string
}

/**
 * Article markup carrying authorship and freshness.
 *
 * Author and publisher are the organization rather than a person: Petbound
 * publishes these figures institutionally, and inventing a byline would be a
 * worse signal than an honest organizational one.
 */
export function articleJsonLd(opts: ArticleInput): object {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    url: absolute(opts.url),
    mainEntityOfPage: { "@type": "WebPage", "@id": absolute(opts.url) },
    author: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
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
