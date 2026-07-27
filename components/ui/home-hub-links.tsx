import Link from "next/link"
import { MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { HubLinkCard } from "@/components/seo/hub-link-card"
import { getAdoptIndexData, getIndexableBreeds } from "@/lib/api/hubs"

/**
 * "Browse by state / breed" section on the homepage. This is the main crawl
 * path into the SEO hub pages, styled to match the site's centered marketing
 * sections (see HeroPets).
 */
export async function HomeHubLinks() {
  const [states, breeds] = await Promise.all([
    getAdoptIndexData(),
    getIndexableBreeds(),
  ])

  if (states.length === 0 && breeds.length === 0) {
    return null
  }

  return (
    <section className="w-full px-4 py-12 pb-16 md:px-8">
      <div className="mx-auto max-w-7xl space-y-16">
        {states.length > 0 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Adopt by state
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">
                Find at-risk pets at shelters near you.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {states.map((state) => (
                <HubLinkCard
                  key={state.code}
                  href={`/adopt/${state.code.toLowerCase()}`}
                  icon={<MapPin />}
                  title={state.name}
                  subtitle={`${state.petCount} ${
                    state.petCount === 1 ? "pet" : "pets"
                  } at risk`}
                />
              ))}
            </div>
            <div className="flex justify-center">
              <Button variant="outline" size="lg" asChild>
                <Link href="/adopt">Browse all states</Link>
              </Button>
            </div>
          </div>
        )}

        {breeds.length > 0 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Adopt by breed
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">
                Looking for a specific breed? Start here.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2.5">
              {breeds.slice(0, 12).map((breed) => (
                <Link
                  key={breed.slug}
                  href={`/breeds/${breed.slug}`}
                  className="rounded-full border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {breed.name}{" "}
                  <span className="text-muted-foreground/60">
                    {breed.count}
                  </span>
                </Link>
              ))}
              <Link
                href="/breeds"
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                All breeds
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
