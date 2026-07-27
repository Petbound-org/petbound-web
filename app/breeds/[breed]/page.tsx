import { notFound } from "next/navigation"

import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { HubHero } from "@/components/seo/hub-hero"
import { HubPetGrid } from "@/components/seo/hub-pet-grid"
import { HubRelatedLinks } from "@/components/seo/hub-related-links"
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
    <div className="min-h-screen">
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

      <HubHero
        eyebrow="Urgent adoptions"
        title={`${data.name}s Available for Adoption`}
        description={`${data.count} ${data.name}s — purebred and mixes — are on shelter euthanasia lists right now. Each one can still be saved.`}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Breeds", href: "/breeds" },
              { name: data.name },
            ]}
          />
        }
      >
        <HubStats
          stats={[
            { value: data.count, label: "pets at risk" },
            {
              value: data.states.length,
              label: data.states.length === 1 ? "state" : "states",
            },
          ]}
          urgentCount={data.urgentCount}
        />
      </HubHero>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
        <HubPetGrid pets={data.pets} />

        <HubRelatedLinks
          heading={`Where ${data.name}s are waiting`}
          links={data.states.map((state) => ({
            href: `/adopt/${state.code.toLowerCase()}`,
            label: `Adopt in ${state.name}`,
          }))}
        />

        <HubRelatedLinks
          heading="Other breeds"
          links={otherBreeds.map((b) => ({
            href: `/breeds/${b.slug}`,
            label: `${b.name} (${b.count})`,
          }))}
        />
      </div>
    </div>
  )
}
