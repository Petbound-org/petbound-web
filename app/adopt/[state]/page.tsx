import { MapPin } from "lucide-react"
import { notFound } from "next/navigation"

import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { HubHero } from "@/components/seo/hub-hero"
import { HubLinkCard } from "@/components/seo/hub-link-card"
import { HubPetGrid } from "@/components/seo/hub-pet-grid"
import { HubRelatedLinks } from "@/components/seo/hub-related-links"
import { HubStats } from "@/components/seo/hub-stats"
import { JsonLd } from "@/components/seo/json-ld"
import { ShelterContactCard } from "@/components/seo/shelter-contact-card"

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
    <div className="min-h-screen">
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

      <HubHero
        eyebrow="Urgent adoptions"
        title={`Adopt a Pet in ${data.name}`}
        description={`These pets are on euthanasia lists at ${data.name} shelters. Adopting — or even sharing — can save a life.`}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Adopt", href: "/adopt" },
              { name: data.name },
            ]}
          />
        }
      >
        <HubStats
          stats={[
            { value: data.petCount, label: "pets at risk" },
            { value: data.shelterCount, label: "shelters" },
            { value: data.cities.length, label: "cities" },
          ]}
          urgentCount={data.urgentCount}
        />
      </HubHero>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Browse by city</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.cities.map((city) => (
              <HubLinkCard
                key={city.slug}
                href={`/adopt/${state}/${city.slug}`}
                icon={<MapPin />}
                title={city.name}
                subtitle={`${city.petCount} ${
                  city.petCount === 1 ? "pet" : "pets"
                } at risk`}
              />
            ))}
          </div>
        </section>

        {data.pets.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Most urgent in {data.name}
            </h2>
            <HubPetGrid pets={data.pets} />
          </section>
        )}

        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Shelters in {data.name}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

        <HubRelatedLinks
          heading="Other states"
          links={data.siblingStates.map((sibling) => ({
            href: `/adopt/${sibling.code.toLowerCase()}`,
            label: `${sibling.name} (${sibling.petCount})`,
          }))}
        />
      </div>
    </div>
  )
}
