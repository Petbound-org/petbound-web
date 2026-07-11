import type { MetadataRoute } from "next"

const BASE_URL = "https://petbound.org"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/saved" },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
