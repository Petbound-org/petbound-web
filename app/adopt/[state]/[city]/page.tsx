import Link from "next/link"
import { notFound } from "next/navigation"

import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { HubHero } from "@/components/seo/hub-hero"
import { HubPetGrid } from "@/components/seo/hub-pet-grid"
import { HubRelatedLinks } from "@/components/seo/hub-related-links"
import { HubStats } from "@/components/seo/hub-stats"
import { JsonLd } from "@/components/seo/json-ld"
import { ShelterContactCard } from "@/components/seo/shelter-contact-card"
import { Button } from "@/components/ui/button"

import { getCityHubData, getShelterSlugs } from "@/lib/api/hubs"
import { collectionPageJsonLd, itemListJsonLd } from "@/lib/seo/schema"

export const revalidate = 1800

interface CityPageProps {
  params: Promise<{ state: string; city: string }>
}

export async function generateMetadata({ params }: CityPageProps) {
  const { state, city } = await params
  if (state !== state.toLowerCase() || city !== city.toLowerCase()) {
    return { title: "Not Found", robots: { index: false } }
  }
  const data = await getCityHubData(state, city)
  if (!data) {
    return { title: "Not Found", robots: { index: false } }
  }

  const place = `${data.cityName}, ${data.stateCode}`
  if (data.pets.length === 0) {
    return {
      title: `Pet Adoption in ${place} — Local Shelters`,
      description: `Find pet adoption resources in ${place}. Local shelters partner with Petbound to list pets at risk of euthanasia.`,
      alternates: { canonical: `/adopt/${state}/${city}` },
    }
  }
  return {
    title: `Adopt a Pet in ${place} — ${data.pets.length} At-Risk ${
      data.pets.length === 1 ? "Pet" : "Pets"
    }`,
    description: `${data.pets.length} pets at ${data.cityName} shelters are on the euthanasia list right now. See their photos and deadlines, and adopt before time runs out.`,
    alternates: { canonical: `/adopt/${state}/${city}` },
  }
}

export default async function CityPage({ params }: CityPageProps) {
  const { state, city } = await params
  if (state !== state.toLowerCase() || city !== city.toLowerCase()) {
    notFound()
  }
  const data = await getCityHubData(state, city)
  if (!data) {
    notFound()
  }

  const shelterSlugs = await getShelterSlugs()
  const slugById = new Map(
    [...shelterSlugs].map(([slug, shelter]) => [shelter.id, slug]),
  )
  const place = `${data.cityName}, ${data.stateName}`
  const hasPets = data.pets.length > 0

  return (
    <div className="min-h-screen">
      <JsonLd
        data={collectionPageJsonLd({
          name: `Adopt a pet in ${place}`,
          description: `Pets at risk of euthanasia at shelters in ${place}.`,
          url: `/adopt/${state}/${city}`,
        })}
      />
      {hasPets && (
        <JsonLd
          data={itemListJsonLd({
            name: `At-risk pets in ${place}`,
            urls: data.pets.slice(0, 24).map((p) => `/pets/${p.id}`),
          })}
        />
      )}

      <HubHero
        eyebrow={hasPets ? "Urgent adoptions" : undefined}
        title={`Adopt a Pet in ${place}`}
        description={
          hasPets
            ? `These pets at ${data.cityName} shelters are running out of time. Meet them before it's too late.`
            : `No pets in ${data.cityName} are on the euthanasia list right now — but local shelters always have animals that need homes.`
        }
        breadcrumbs={
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Adopt", href: "/adopt" },
              { name: data.stateName, href: `/adopt/${state}` },
              { name: data.cityName },
            ]}
          />
        }
      >
        <HubStats
          stats={[
            { value: data.pets.length, label: "pets at risk" },
            {
              value: data.shelters.length,
              label: data.shelters.length === 1 ? "shelter" : "shelters",
            },
          ]}
          urgentCount={data.urgentCount}
        />
      </HubHero>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
        {hasPets ? (
          <HubPetGrid pets={data.pets} />
        ) : (
          <div className="space-y-4 rounded-xl border bg-muted/40 p-6">
            <p className="text-muted-foreground">
              Check back soon, or browse at-risk pets across {data.stateName}.
            </p>
            <Button asChild>
              <Link href={`/adopt/${state}`}>See pets in {data.stateName}</Link>
            </Button>
          </div>
        )}

        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">
            {data.shelters.length === 1 ? "Shelter" : "Shelters"} in{" "}
            {data.cityName}
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
          heading={`Other cities in ${data.stateName}`}
          links={data.siblingCities.map((sibling) => ({
            href: `/adopt/${state}/${sibling.slug}`,
            label: sibling.name,
          }))}
        />
      </div>
    </div>
  )
}
