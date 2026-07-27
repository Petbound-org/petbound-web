import { Building2 } from "lucide-react"

import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { HubHero } from "@/components/seo/hub-hero"
import { HubLinkCard } from "@/components/seo/hub-link-card"
import { HubStats } from "@/components/seo/hub-stats"
import { JsonLd } from "@/components/seo/json-ld"

import { getLivePets, getShelterSlugs } from "@/lib/api/hubs"
import { collectionPageJsonLd } from "@/lib/seo/schema"
import { titleCase } from "@/lib/seo/slug"
import { stateCodeFrom, stateNameFromCode } from "@/lib/seo/states"

export const revalidate = 1800

export const metadata = {
  title: "Partner Shelters",
  description:
    "The animal shelters working with Petbound to find homes for pets at risk of euthanasia. Find a shelter near you and see the pets that need help today.",
  alternates: { canonical: "/shelters" },
}

export default async function SheltersPage() {
  const [slugs, pets] = await Promise.all([getShelterSlugs(), getLivePets()])

  const petCounts = new Map<number, number>()
  for (const pet of pets) {
    if (pet.shelter_id != null) {
      petCounts.set(pet.shelter_id, (petCounts.get(pet.shelter_id) ?? 0) + 1)
    }
  }

  const byState = new Map<
    string,
    Array<{ slug: string; name: string; city: string | null; count: number }>
  >()
  for (const [slug, shelter] of slugs) {
    const code = stateCodeFrom(shelter.state)
    const stateName = code ? stateNameFromCode(code) : null
    if (!stateName) continue
    let list = byState.get(stateName)
    if (!list) {
      list = []
      byState.set(stateName, list)
    }
    list.push({
      slug,
      name: shelter.name ?? "Partner Shelter",
      city: shelter.city ? titleCase(shelter.city) : null,
      count: petCounts.get(shelter.id) ?? 0,
    })
  }

  const states = [...byState.entries()].sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="min-h-screen">
      <JsonLd
        data={collectionPageJsonLd({
          name: "Petbound partner shelters",
          description: metadata.description,
          url: "/shelters",
        })}
      />

      <HubHero
        title="Partner Shelters"
        description="These shelters list their most at-risk pets on Petbound. Every adoption directly saves a life."
        breadcrumbs={
          <Breadcrumbs
            items={[{ name: "Home", href: "/" }, { name: "Shelters" }]}
          />
        }
      >
        <HubStats
          stats={[
            { value: slugs.size, label: "partner shelters" },
            { value: states.length, label: "states" },
          ]}
        />
      </HubHero>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
        {states.map(([stateName, shelters]) => (
          <section key={stateName} className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">{stateName}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shelters
                .sort((a, b) => b.count - a.count)
                .map((shelter) => (
                  <HubLinkCard
                    key={shelter.slug}
                    href={`/shelters/${shelter.slug}`}
                    icon={<Building2 />}
                    title={shelter.name}
                    subtitle={`${shelter.city ? `${shelter.city} · ` : ""}${
                      shelter.count === 1
                        ? "1 pet at risk"
                        : `${shelter.count} pets at risk`
                    }`}
                  />
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
