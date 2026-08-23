import type { MetadataRoute } from "next"

const BASE_URL = "https://www.petbound.org"

export default function robots(): MetadataRoute.Robots {
  return {
    // /saved is kept out of the index by robots:{index:false} in
    // app/saved/layout.tsx, not by a Disallow here. Disallowing it blocks
    // crawling, which means Google never reads the noindex tag and indexes the
    // bare URL from internal links anyway. Allowing the crawl is what actually
    // removes it.
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
