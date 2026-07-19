import Link from "next/link"

import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { JsonLd } from "@/components/seo/json-ld"
import { Card, CardContent } from "@/components/ui/card"

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <JsonLd
          data={collectionPageJsonLd({
            name: "Adoptable pets by breed",
            description: metadata.description,
            url: "/breeds",
          })}
        />
        <Breadcrumbs
          items={[{ name: "Home", href: "/" }, { name: "Breeds" }]}
        />

        <header className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Adoptable Pets by Breed
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Looking for a specific breed? These pets are on shelter euthanasia
            lists and need homes urgently. Mixes are included with their base
            breed.
          </p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {breeds.map((breed) => (
            <Link key={breed.slug} href={`/breeds/${breed.slug}`}>
              <Card className="h-full transition-colors hover:border-primary">
                <CardContent className="pt-6 space-y-1">
                  <p className="font-semibold">{breed.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {breed.count === 1 ? "1 pet" : `${breed.count} pets`}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
