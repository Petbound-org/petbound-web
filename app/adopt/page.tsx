import { MapPin } from "lucide-react"

import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { HubHero } from "@/components/seo/hub-hero"
import { HubLinkCard } from "@/components/seo/hub-link-card"
import { HubStats } from "@/components/seo/hub-stats"
import { JsonLd } from "@/components/seo/json-ld"

import { getAdoptIndexData } from "@/lib/api/hubs"
import { collectionPageJsonLd } from "@/lib/seo/schema"

export const revalidate = 1800

export const metadata = {
  title: "Adopt At-Risk Shelter Pets by State",
  description:
    "Browse pets on shelter euthanasia lists by state. Every listing is urgent — find adoptable dogs and cats near you before time runs out.",
  alternates: { canonical: "/adopt" },
}

export default async function AdoptIndexPage() {
  const states = await getAdoptIndexData()
  const totalPets = states.reduce((sum, s) => sum + s.petCount, 0)
  const totalShelters = states.reduce((sum, s) => sum + s.shelterCount, 0)

  return (
    <div className="min-h-screen">
      <JsonLd
        data={collectionPageJsonLd({
          name: "Adopt at-risk shelter pets by state",
          description: metadata.description,
          url: "/adopt",
        })}
      />

      <HubHero
        eyebrow="Urgent adoptions"
        title="Adopt a Pet Before Time Runs Out"
        description="Every pet on Petbound is on a shelter euthanasia list. Pick your state to see who needs a home near you."
        breadcrumbs={
          <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Adopt" }]} />
        }
      >
        <HubStats
          stats={[
            { value: totalPets, label: "pets at risk" },
            { value: states.length, label: "states" },
            { value: totalShelters, label: "shelters" },
          ]}
        />
      </HubHero>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight">Browse by state</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {states.map((state) => (
            <HubLinkCard
              key={state.code}
              href={`/adopt/${state.code.toLowerCase()}`}
              icon={<MapPin />}
              title={state.name}
              subtitle={`${state.petCount} ${
                state.petCount === 1 ? "pet" : "pets"
              } · ${state.shelterCount} ${
                state.shelterCount === 1 ? "shelter" : "shelters"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
