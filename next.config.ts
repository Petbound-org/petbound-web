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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ]
  },
}

export default nextConfig
