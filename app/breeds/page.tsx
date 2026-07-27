import { PawPrint } from "lucide-react"

import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { HubHero } from "@/components/seo/hub-hero"
import { HubLinkCard } from "@/components/seo/hub-link-card"
import { HubStats } from "@/components/seo/hub-stats"
import { JsonLd } from "@/components/seo/json-ld"

import { getIndexableBreeds } from "@/lib/api/hubs"
import { collectionPageJsonLd } from "@/lib/seo/schema"

export const revalidate = 1800

export const metadata = {
  title: "Adoptable Pets by Breed",
  description:
    "Browse pets on shelter euthanasia lists by breed — Pit Bulls, German Shepherds, Huskies, Labs, and more. Every one of them needs a home now.",
  alternates: { canonical: "/breeds" },
}

export default async function BreedsPage() {
  const breeds = await getIndexableBreeds()
  const totalPets = breeds.reduce((sum, b) => sum + b.count, 0)

  return (
    <div className="min-h-screen">
      <JsonLd
        data={collectionPageJsonLd({
          name: "Adoptable pets by breed",
          description: metadata.description,
          url: "/breeds",
        })}
      />

      <HubHero
        eyebrow="Urgent adoptions"
        title="Adoptable Pets by Breed"
        description="Looking for a specific breed? These pets are on shelter euthanasia lists and need homes urgently. Mixes are included with their base breed."
        breadcrumbs={
          <Breadcrumbs
            items={[{ name: "Home", href: "/" }, { name: "Breeds" }]}
          />
        }
      >
        <HubStats
          stats={[
            { value: totalPets, label: "pets at risk" },
            { value: breeds.length, label: "breeds" },
          ]}
        />
      </HubHero>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight">Browse by breed</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {breeds.map((breed) => (
            <HubLinkCard
              key={breed.slug}
              href={`/breeds/${breed.slug}`}
              icon={<PawPrint />}
              title={breed.name}
              subtitle={`${breed.count} ${breed.count === 1 ? "pet" : "pets"}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
