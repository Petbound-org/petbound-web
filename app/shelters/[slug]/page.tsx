import Link from "next/link"
import { notFound } from "next/navigation"

import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { HubHero } from "@/components/seo/hub-hero"
import { HubPetGrid } from "@/components/seo/hub-pet-grid"
import { HubStats } from "@/components/seo/hub-stats"
import { JsonLd } from "@/components/seo/json-ld"
import { ShelterContactCard } from "@/components/seo/shelter-contact-card"
import { Button } from "@/components/ui/button"

import { getShelterHubData } from "@/lib/api/hubs"
import {
  animalShelterJsonLd,
  faqPageJsonLd,
  itemListJsonLd,
} from "@/lib/seo/schema"
import {
  shelterFaqItems,
  shelterMetaDescription,
  type ShelterAnswerInput,
} from "@/lib/seo/shelter-summary"

export const revalidate = 1800

/**
 * Empty on purpose. `revalidate` above is inert without this: Next renders a
 * dynamic segment with no generateStaticParams on every request and never
 * caches it. Returning [] prerenders nothing at build while still registering
 * the route for ISR, so each URL renders at most once per interval.
 */
export function generateStaticParams() {
  return []
}

interface ShelterPageProps {
  params: Promise<{ slug: string }>
}

/**
 * These pages previously targeted the shelter's own name, which is navigational
 * intent we cannot win: that searcher wants the shelter's site, hours, and
 * phone number, and Google already gives them that plus a Business Profile.
 * They now target the modifier queries ("is X a kill shelter", "X euthanasia
 * list") where our per-pet deadline data is the only source that answers.
 */
function answerInput(
  data: NonNullable<Awaited<ReturnType<typeof getShelterHubData>>>,
): ShelterAnswerInput {
  return {
    shelterName: data.shelter.name ?? "Animal Shelter",
    cityName: data.cityName,
    stateName: data.stateName,
    pets: data.pets,
  }
}

export async function generateMetadata({ params }: ShelterPageProps) {
  const { slug } = await params
  const data = await getShelterHubData(slug)
  if (!data) {
    return { title: "Shelter Not Found", robots: { index: false } }
  }

  const input = answerInput(data)
  const count = data.pets.length

  return {
    title: count
      ? `Is ${input.shelterName} a Kill Shelter? ${count} Pets at Risk`
      : `Is ${input.shelterName} a Kill Shelter?`,
    description: shelterMetaDescription(input),
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
  const input = answerInput(data)
  const name = input.shelterName
  const hasPets = pets.length > 0
  const faqs = shelterFaqItems(input)
  // faqs[0] is the primary question. It is rendered on its own above, so the
  // list below skips it: the JSON-LD still carries every pair, and every answer
  // is still visible on the page, which is what Google requires.
  const [primaryFaq, ...secondaryFaqs] = faqs
  const cityHref =
    stateCode && data.citySlug
      ? `/adopt/${stateCode.toLowerCase()}/${data.citySlug}`
      : null

  return (
    <div className="min-h-screen">
      <JsonLd data={animalShelterJsonLd(shelter, `/shelters/${slug}`)} />
      {/* Answers below are rendered on the page, which Google requires. */}
      <JsonLd data={faqPageJsonLd(faqs)} />
      {hasPets && (
        <JsonLd
          data={itemListJsonLd({
            name: `Pets at risk at ${name}`,
            urls: pets.slice(0, 24).map((p) => `/pets/${p.id}`),
          })}
        />
      )}

      <HubHero
        eyebrow={hasPets ? "Urgent adoptions" : undefined}
        title={name}
        description={
          cityName && stateName
            ? `Animal shelter in ${cityName}, ${stateName}. Petbound tracks the pets here that have a euthanasia date scheduled.`
            : undefined
        }
        breadcrumbs={
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Shelters", href: "/shelters" },
              { name },
            ]}
          />
        }
      >
        <HubStats
          stats={[{ value: pets.length, label: "pets at risk right now" }]}
          urgentCount={urgentCount}
        />
      </HubHero>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Lead with the answer. Extraction takes the first passage under a
            matching heading, so nothing may sit between the two. */}
        <section className="mb-12 max-w-3xl space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            {primaryFaq.question}
          </h2>
          <p className="text-lg leading-relaxed text-foreground/90">
            {primaryFaq.answer}
          </p>
        </section>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <h2 className="text-2xl font-bold tracking-tight">
              {hasPets ? `Pets waiting at ${name}` : "No current listings"}
            </h2>
            {hasPets ? (
              <HubPetGrid pets={pets} />
            ) : (
              <div className="space-y-4 rounded-xl border bg-muted/40 p-6">
                <p className="text-muted-foreground">
                  This shelter has no pets on the euthanasia list right now.
                  Check nearby listings. Other pets in the area still need
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
                <Link
                  href={cityHref}
                  className="underline hover:text-foreground"
                >
                  pet adoption in {cityName}, {stateName}
                </Link>
              </p>
            )}
          </div>
        </div>

        <section className="mt-16 max-w-3xl space-y-8 border-t pt-10">
          <h2 className="text-2xl font-bold tracking-tight">
            Common questions about {name}
          </h2>
          {/* Plain headings and paragraphs rather than an accordion: the text
              stays in the DOM for crawlers and AI extraction, and it avoids
              pulling in a collapsible primitive the app does not have. */}
          <div className="space-y-6">
            {secondaryFaqs.map((faq) => (
              <div key={faq.question} className="space-y-2">
                <h3 className="text-lg font-semibold">{faq.question}</h3>
                <p className="leading-relaxed text-muted-foreground">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
