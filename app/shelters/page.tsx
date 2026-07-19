import Link from "next/link"

import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { JsonLd } from "@/components/seo/json-ld"
import { Card, CardContent } from "@/components/ui/card"

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <JsonLd
          data={collectionPageJsonLd({
            name: "Petbound partner shelters",
            description: metadata.description,
            url: "/shelters",
          })}
        />
        <Breadcrumbs
          items={[{ name: "Home", href: "/" }, { name: "Shelters" }]}
        />

        <header className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Partner Shelters
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            These shelters list their most at-risk pets on Petbound. Every
            adoption directly saves a life.
          </p>
        </header>

        {states.map(([stateName, shelters]) => (
          <section key={stateName} className="space-y-4">
            <h2 className="text-2xl font-bold">{stateName}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shelters
                .sort((a, b) => b.count - a.count)
                .map((shelter) => (
                  <Link key={shelter.slug} href={`/shelters/${shelter.slug}`}>
                    <Card className="h-full transition-colors hover:border-primary">
                      <CardContent className="pt-6 space-y-1">
                        <p className="font-semibold">{shelter.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {shelter.city && <span>{shelter.city} · </span>}
                          {shelter.count === 1
                            ? "1 pet at risk"
                            : `${shelter.count} pets at risk`}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
