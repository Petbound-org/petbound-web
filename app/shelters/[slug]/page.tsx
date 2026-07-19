import Link from "next/link"
import { notFound } from "next/navigation"

import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { HubPetGrid } from "@/components/seo/hub-pet-grid"
import { HubStats } from "@/components/seo/hub-stats"
import { JsonLd } from "@/components/seo/json-ld"
import { ShelterContactCard } from "@/components/seo/shelter-contact-card"
import { Button } from "@/components/ui/button"

import { getShelterHubData } from "@/lib/api/hubs"
import { animalShelterJsonLd, itemListJsonLd } from "@/lib/seo/schema"

export const revalidate = 1800

interface ShelterPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ShelterPageProps) {
  const { slug } = await params
  const data = await getShelterHubData(slug)
  if (!data) {
    return { title: "Shelter Not Found", robots: { index: false } }
  }

  const name = data.shelter.name ?? "Partner Shelter"
  const place = [data.cityName, data.stateCode].filter(Boolean).join(", ")
  return {
    title: place ? `${name} — Adoptable Pets in ${place}` : name,
    description: `${data.pets.length} pets at ${name}${
      place ? ` in ${place}` : ""
    } are at risk of euthanasia. See their photos, deadlines, and how to adopt before time runs out.`,
    alternates: { canonical: `/shelters/${slug}` },
  }
}

export default async function ShelterPage({ params }: ShelterPageProps) {
  const { slug } = await params
  const data = await getShelterHubData(slug)
  if (!data) {
    notFound()
  }

  const { shelter, pets, urgentCount, cityName, stateCode, stateName } = data
  const name = shelter.name ?? "Partner Shelter"
  const cityHref =
    stateCode && data.citySlug
      ? `/adopt/${stateCode.toLowerCase()}/${data.citySlug}`
      : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <JsonLd data={animalShelterJsonLd(shelter, `/shelters/${slug}`)} />
        {pets.length > 0 && (
          <JsonLd
            data={itemListJsonLd({
              name: `Adoptable pets at ${name}`,
              urls: pets.slice(0, 24).map((p) => `/pets/${p.id}`),
            })}
          />
        )}

        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Shelters", href: "/shelters" },
            { name },
          ]}
        />

        <header className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            {name}
          </h1>
          {cityName && stateName && (
            <p className="text-xl text-muted-foreground">
              Animal shelter in {cityName}, {stateName} partnering with
              Petbound to find homes for pets on the euthanasia list.
            </p>
          )}
        </header>

        <HubStats
          stats={[{ value: pets.length, label: "pets at risk right now" }]}
          urgentCount={urgentCount}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold">
              {pets.length > 0
                ? `Pets waiting at ${name}`
                : "No current listings"}
            </h2>
            {pets.length > 0 ? (
              <HubPetGrid pets={pets} />
            ) : (
              <div className="rounded-xl border bg-muted/40 p-6 space-y-4">
                <p className="text-muted-foreground">
                  This shelter has no pets on the euthanasia list right now.
                  Check nearby listings — other pets in the area still need
                  homes.
                </p>
                <Button asChild>
                  <Link href={cityHref ?? "/explore"}>
                    {cityName
                      ? `See pets near ${cityName}`
                      : "Browse available pets"}
                  </Link>
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <ShelterContactCard shelter={shelter} />
            {cityHref && cityName && stateName && (
              <p className="text-sm text-muted-foreground">
                More pets nearby:{" "}
                <Link href={cityHref} className="underline hover:text-foreground">
                  pet adoption in {cityName}, {stateName}
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
