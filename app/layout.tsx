import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { GoogleAnalytics } from "@next/third-parties/google"

import "./globals.css"
import { JsonLd } from "@/components/seo/json-ld"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { FavoritesProvider } from "@/lib/favorites-context"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Petbound",
    template: "%s — Petbound",
  },
  description:
    "The adoption platform built exclusively for animals at risk of euthanasia.",
  metadataBase: new URL("https://www.petbound.org"),
  icons: {
    icon: "/images/logo-7.png",
  },
  openGraph: {
    title: "Petbound",
    description:
      "The adoption platform built exclusively for animals at risk of euthanasia.",
    type: "website",
    siteName: "Petbound",
    url: "https://www.petbound.org",
    images: [{ url: "/images/logo-7.png" }],
  },
  twitter: {
    card: "summary",
    title: "Petbound",
    description:
      "The adoption platform built exclusively for animals at risk of euthanasia.",
    images: ["/images/logo-7.png"],
  },
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: "Petbound",
  url: "https://www.petbound.org",
  logo: "https://www.petbound.org/images/logo-7.png",
  email: "petboundorg@gmail.com",
  description:
    "The adoption platform built exclusively for animals at risk of euthanasia.",
  sameAs: ["https://www.instagram.com/petboundorg/"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <JsonLd data={organizationJsonLd} />
        <FavoritesProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </FavoritesProvider>
        <SpeedInsights />
      </body>
      <GoogleAnalytics gaId="G-Z8YVVZGJYZ" />
    </html>
  )
}
