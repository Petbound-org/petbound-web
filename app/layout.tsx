import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { SpeedInsights } from "@vercel/speed-insights/next"

import "./globals.css"
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
  metadataBase: new URL("https://petbound.org"),
  icons: {
    icon: "/images/logo-7.png",
  },
  openGraph: {
    title: "Petbound",
    description:
      "The adoption platform built exclusively for animals at risk of euthanasia.",
    type: "website",
    url: "https://petbound.org",
  },
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
        <FavoritesProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </FavoritesProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
