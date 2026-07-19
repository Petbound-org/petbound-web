import Link from "next/link"

import { getAdoptIndexData, getIndexableBreeds } from "@/lib/api/hubs"

/**
 * "Browse by state / breed" link clusters on the homepage. This is the main
 * crawl path into the SEO hub pages — keep it server-rendered plain links.
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
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {states.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-2xl font-bold">Adopt by state</h2>
          <p className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-2">
            {states.map((state) => (
              <Link
                key={state.code}
                href={`/adopt/${state.code.toLowerCase()}`}
                className="underline hover:text-foreground"
              >
                {state.name} ({state.petCount})
              </Link>
            ))}
            <Link href="/adopt" className="underline hover:text-foreground">
              All states
            </Link>
          </p>
        </div>
      )}

      {breeds.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-2xl font-bold">Adopt by breed</h2>
          <p className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-2">
            {breeds.slice(0, 10).map((breed) => (
              <Link
                key={breed.slug}
                href={`/breeds/${breed.slug}`}
                className="underline hover:text-foreground"
              >
                {breed.name} ({breed.count})
              </Link>
            ))}
            <Link href="/breeds" className="underline hover:text-foreground">
              All breeds
            </Link>
          </p>
        </div>
      )}
    </section>
  )
}
