import Link from "next/link"
import { notFound } from "next/navigation"

import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { HubPetGrid } from "@/components/seo/hub-pet-grid"
import { HubStats } from "@/components/seo/hub-stats"
import { JsonLd } from "@/components/seo/json-ld"
import { ShelterContactCard } from "@/components/seo/shelter-contact-card"
import { Card, CardContent } from "@/components/ui/card"

import { getShelterSlugs, getStateHubData } from "@/lib/api/hubs"
import { collectionPageJsonLd, itemListJsonLd } from "@/lib/seo/schema"

export const revalidate = 1800

interface StatePageProps {
  params: Promise<{ state: string }>
}

export async function generateMetadata({ params }: StatePageProps) {
  const { state } = await params
  if (state !== state.toLowerCase()) {
    return { title: "Not Found", robots: { index: false } }
  }
  const data = await getStateHubData(state)
  if (!data) {
    return { title: "Not Found", robots: { index: false } }
  }

  return {
    title: `Adopt a Pet in ${data.name} — ${data.petCount} At-Risk Pets Need Homes`,
    description: `${data.petCount} pets across ${data.shelterCount} ${
      data.shelterCount === 1 ? "shelter" : "shelters"
    } in ${data.name} are on euthanasia lists right now. Browse by city and adopt before their time runs out.`,
    alternates: { canonical: `/adopt/${state}` },
  }
}

export default async function StatePage({ params }: StatePageProps) {
  const { state } = await params
  if (state !== state.toLowerCase()) {
    notFound()
  }
  const data = await getStateHubData(state)
  if (!data) {
    notFound()
  }

  const shelterSlugs = await getShelterSlugs()
  const slugById = new Map(
    [...shelterSlugs].map(([slug, shelter]) => [shelter.id, slug]),
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <JsonLd
          data={collectionPageJsonLd({
            name: `Adopt a pet in ${data.name}`,
            description: `Pets at risk of euthanasia in ${data.name} shelters.`,
            url: `/adopt/${state}`,
          })}
        />
        {data.pets.length > 0 && (
          <JsonLd
            data={itemListJsonLd({
              name: `At-risk pets in ${data.name}`,
              urls: data.pets.slice(0, 24).map((p) => `/pets/${p.id}`),
            })}
          />
        )}

        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Adopt", href: "/adopt" },
            { name: data.name },
          ]}
        />

        <header className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Adopt a Pet in {data.name}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            These pets are on euthanasia lists at {data.name} shelters. Adopting
            — or even sharing — can save a life.
          </p>
        </header>

        <HubStats
          stats={[
            { value: data.petCount, label: "pets at risk" },
            { value: data.shelterCount, label: "shelters" },
            { value: data.cities.length, label: "cities" },
          ]}
          urgentCount={data.urgentCount}
        />

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Browse by city</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.cities.map((city) => (
              <Link
                key={city.slug}
                href={`/adopt/${state}/${city.slug}`}
              >
                <Card className="h-full transition-colors hover:border-primary">
                  <CardContent className="pt-6 space-y-1">
                    <p className="font-semibold">{city.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {city.petCount === 1
                        ? "1 pet"
                        : `${city.petCount} pets`}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {data.pets.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">
              Most urgent in {data.name}
            </h2>
            <HubPetGrid pets={data.pets} />
          </section>
        )}

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Shelters in {data.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.shelters.map((shelter) => (
              <ShelterContactCard
                key={shelter.id}
                shelter={shelter}
                href={
                  slugById.has(shelter.id)
                    ? `/shelters/${slugById.get(shelter.id)}`
                    : undefined
                }
              />
            ))}
          </div>
        </section>

        {data.siblingStates.length > 0 && (
          <section className="space-y-3 border-t pt-8">
            <h2 className="text-lg font-semibold">Other states</h2>
            <p className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-2">
              {data.siblingStates.map((sibling) => (
                <Link
                  key={sibling.code}
                  href={`/adopt/${sibling.code.toLowerCase()}`}
                  className="underline hover:text-foreground"
                >
                  Adopt a pet in {sibling.name}
                </Link>
              ))}
            </p>
          </section>
        )}
      </div>
    </div>
  )
}
