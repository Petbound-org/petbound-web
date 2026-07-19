import Link from "next/link"
import { notFound } from "next/navigation"

import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { HubPetGrid } from "@/components/seo/hub-pet-grid"
import { HubStats } from "@/components/seo/hub-stats"
import { JsonLd } from "@/components/seo/json-ld"

import { getBreedHubData, getIndexableBreeds } from "@/lib/api/hubs"
import { collectionPageJsonLd, itemListJsonLd } from "@/lib/seo/schema"

export const revalidate = 1800

interface BreedPageProps {
  params: Promise<{ breed: string }>
}

export async function generateMetadata({ params }: BreedPageProps) {
  const { breed } = await params
  if (breed !== breed.toLowerCase()) {
    return { title: "Not Found", robots: { index: false } }
  }
  const data = await getBreedHubData(breed)
  if (!data) {
    return { title: "Not Found", robots: { index: false } }
  }

  return {
    title: `Adopt a ${data.name} — ${data.count} Available Now`,
    description: `${data.count} ${data.name}s (including mixes) are on shelter euthanasia lists right now. See their photos and deadlines, and adopt one before time runs out.`,
    alternates: { canonical: `/breeds/${breed}` },
  }
}

export default async function BreedPage({ params }: BreedPageProps) {
  const { breed } = await params
  if (breed !== breed.toLowerCase()) {
    notFound()
  }
  const data = await getBreedHubData(breed)
  if (!data) {
    notFound()
  }

  const otherBreeds = (await getIndexableBreeds())
    .filter((b) => b.slug !== breed)
    .slice(0, 12)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <JsonLd
          data={collectionPageJsonLd({
            name: `Adopt a ${data.name}`,
            description: `${data.name}s at risk of euthanasia in partner shelters.`,
            url: `/breeds/${breed}`,
          })}
        />
        <JsonLd
          data={itemListJsonLd({
            name: `Adoptable ${data.name}s`,
            urls: data.pets.slice(0, 24).map((p) => `/pets/${p.id}`),
          })}
        />

        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Breeds", href: "/breeds" },
            { name: data.name },
          ]}
        />

        <header className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            {data.name}s Available for Adoption
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            {data.count} {data.name}s — purebred and mixes — are on shelter
            euthanasia lists right now. Each one can still be saved.
          </p>
        </header>

        <HubStats
          stats={[
            { value: data.count, label: "pets at risk" },
            { value: data.states.length, label: data.states.length === 1 ? "state" : "states" },
          ]}
          urgentCount={data.urgentCount}
        />

        <HubPetGrid pets={data.pets} />

        {data.states.length > 0 && (
          <section className="space-y-3 border-t pt-8">
            <h2 className="text-lg font-semibold">
              Where {data.name}s are waiting
            </h2>
            <p className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-2">
              {data.states.map((state) => (
                <Link
                  key={state.code}
                  href={`/adopt/${state.code.toLowerCase()}`}
                  className="underline hover:text-foreground"
                >
                  Adopt a pet in {state.name}
                </Link>
              ))}
            </p>
          </section>
        )}

        {otherBreeds.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Other breeds</h2>
            <p className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-2">
              {otherBreeds.map((b) => (
                <Link
                  key={b.slug}
                  href={`/breeds/${b.slug}`}
                  className="underline hover:text-foreground"
                >
                  {b.name} ({b.count})
                </Link>
              ))}
            </p>
          </section>
        )}
      </div>
    </div>
  )
}
