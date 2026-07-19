import Link from "next/link"

import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { JsonLd } from "@/components/seo/json-ld"
import { Card, CardContent } from "@/components/ui/card"

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <JsonLd
          data={collectionPageJsonLd({
            name: "Adopt at-risk shelter pets by state",
            description: metadata.description,
            url: "/adopt",
          })}
        />
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Adopt" }]} />

        <header className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Adopt a Pet Before Time Runs Out
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Every pet on Petbound is on a shelter euthanasia list. Pick your
            state to see who needs a home near you.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {states.map((state) => (
            <Link key={state.code} href={`/adopt/${state.code.toLowerCase()}`}>
              <Card className="h-full transition-colors hover:border-primary">
                <CardContent className="pt-6 space-y-1">
                  <p className="text-lg font-semibold">{state.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {state.petCount === 1
                      ? "1 pet at risk"
                      : `${state.petCount} pets at risk`}{" "}
                    · {state.shelterCount}{" "}
                    {state.shelterCount === 1 ? "shelter" : "shelters"}
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
