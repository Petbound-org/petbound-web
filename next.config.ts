import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    // Vercel's Image Optimization free tier caps at 5,000 transformations/mo.
    // With ~840 external, shelter-hosted pet images each fanning out to Next's
    // 8 default device widths, a single crawl of the sitemap exceeds the cap and
    // then every new variant errors. This workload (hundreds of DB-driven remote
    // images) is a poor fit for the optimizer on the free tier, so we bypass it
    // and serve source images directly — unlimited and free. Re-enable (and cap
    // deviceSizes/imageSizes + raise minimumCacheTTL) only on a paid plan or with
    // a custom loader (e.g. Supabase/Cloudinary).
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async redirects() {
    // Five hostnames alias the same production deployment. Only
    // www.petbound.org should be indexable; the rest split ranking signals
    // across duplicate copies of the whole site.
    //
    // petbound-web.vercel.app serves a 200 with no x-robots-tag, so Google can
    // crawl and index it. Canonical tags point at www, which mitigates but does
    // not prevent indexing or the wasted crawl budget.
    //
    // The petbound.org rule is a safety net only: that redirect is currently
    // configured at the Vercel domain level and fires at the edge before the
    // request reaches Next, so this rule does not run today. It matters if the
    // dashboard redirect is ever removed. The dashboard one is a 307
    // (temporary) and must be switched to permanent there; the CLI has no
    // command for the redirect status code.
    const canonicalHost = "https://www.petbound.org"
    return ["petbound-web.vercel.app", "petbound.org"].map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: `${canonicalHost}/:path*`,
      permanent: true,
    }))
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            // Allow geolocation for our own origin (the Explore "near me"
            // search); keep camera/microphone fully disabled. An empty
            // geolocation=() allowlist blocks even self, which silently broke
            // getCurrentPosition in every browser.
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ]
  },
}

export default nextConfig
