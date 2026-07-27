import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Calendar, Heart, Mail, Phone } from "lucide-react"

import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { HubPetGrid } from "@/components/seo/hub-pet-grid"
import { ShelterContactCard } from "@/components/seo/shelter-contact-card"
import {
  getIndexableBreeds,
  getShelterSlugs,
  getSimilarPets,
} from "@/lib/api/hubs"
import { getPetById } from "@/lib/api/pets"
import { getShelterById } from "@/lib/api/shelters"
import { breedSlug, normalizeBreed } from "@/lib/seo/breeds"
import { petSummary } from "@/lib/seo/pet-summary"
import { slugify, titleCase } from "@/lib/seo/slug"
import { stateCodeFrom, stateNameFromCode } from "@/lib/seo/states"

interface PetPageProps {
  params: Promise<{ id: string }>
}

function daysLeft(dateStr: string | null): number | null {
  if (!dateStr) return null
  const target = new Date(dateStr).getTime()
  const now = Date.now()
  const diff = target - now
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function cleanDescription(input: string | null): string {
  if (!input) return ""
  if (input.startsWith("***** AVAILABLE FOR ADOPTION NOW ***** ")) {
    return input.substring(39)
  }
  return input
}

function cleanEuthanasiaReason(input: string | null): string | null {
  if (!input) return null
  if (input === "Space") return "Lack of Space"
  return input
}

export async function generateMetadata({ params }: PetPageProps) {
  // Root layout title template appends "— Petbound", so titles here stay bare.
  const { id } = await params
  const petId = Number(id)
  if (!Number.isFinite(petId)) {
    return { title: "Pet" }
  }
  const pet = await getPetById(petId)
  if (!pet) {
    return { title: "Pet Not Found", robots: { index: false } }
  }

  const shelter = pet.shelter_id ? await getShelterById(pet.shelter_id) : null
  const breed = normalizeBreed(pet.breed)
  const city = shelter?.city ? titleCase(shelter.city) : null
  const state = stateCodeFrom(shelter?.state ?? null)

  // "Adopt Max — Labrador Retriever in Bakersfield, CA", degrading gracefully
  // when breed or location is missing.
  let title = pet.name ?? "Adoptable Pet"
  if (pet.name) {
    const where = city && state ? ` in ${city}, ${state}` : ""
    title = breed
      ? `Adopt ${pet.name} — ${breed}${where}`
      : `Adopt ${pet.name}${where}`
  }

  // Unique, data-driven fallback so pages with empty/short shelter descriptions
  // still get a distinct meta description instead of boilerplate.
  const summary = petSummary(pet, {
    cityName: city,
    stateName: state ? stateNameFromCode(state) : null,
    shelterName: shelter?.name ?? null,
    daysLeft: daysLeft(pet.euthanasia_date),
    reason: cleanEuthanasiaReason(pet.euthanasia_reason),
    breedName: breed,
  })
  const description = (cleanDescription(pet.description).trim() || summary).slice(
    0,
    160,
  )
  const image = pet.image_urls?.[0]

  return {
    title,
    description,
    alternates: { canonical: `/pets/${petId}` },
    openGraph: {
      title: `${title} — Petbound`,
      description,
      type: "website",
      url: `/pets/${petId}`,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: `${title} — Petbound`,
      description,
      ...(image ? { images: [image] } : {}),
    },
  }
}

export default async function PetPage({ params }: PetPageProps) {
  const { id } = await params
  const petId = Number(id)

  if (!Number.isFinite(petId)) {
    notFound()
  }

  const pet = await getPetById(petId)

  // Real 404 status (rendered by not-found.tsx) so removed pets aren't soft-404s.
  if (!pet) {
    notFound()
  }

  const shelter = pet.shelter_id ? await getShelterById(pet.shelter_id) : null
  const days = daysLeft(pet.euthanasia_date)
  const description = cleanDescription(pet.description)
  const reason = cleanEuthanasiaReason(pet.euthanasia_reason)
  const hasImage = Boolean(pet.image_urls && pet.image_urls.length > 0)

  const [shelterSlugs, indexableBreeds, similarPets] = await Promise.all([
    getShelterSlugs(),
    getIndexableBreeds(),
    getSimilarPets(pet, 4),
  ])

  const stateCode = stateCodeFrom(shelter?.state ?? null)
  const stateName = stateCode ? stateNameFromCode(stateCode) : null
  const cityName = shelter?.city ? titleCase(shelter.city) : null
  const citySlug = shelter?.city ? slugify(shelter.city) : null
  const breedName = normalizeBreed(pet.breed)
  const breedHref =
    breedName && indexableBreeds.some((b) => b.slug === breedSlug(breedName))
      ? `/breeds/${breedSlug(breedName)}`
      : undefined
  const shelterSlug = shelter
    ? [...shelterSlugs].find(([, s]) => s.id === shelter.id)?.[0]
    : undefined

  const summary = petSummary(pet, {
    cityName,
    stateName,
    shelterName: shelter?.name ?? null,
    daysLeft: days,
    reason,
    breedName,
  })

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Adopt", href: "/adopt" },
    ...(stateCode && stateName
      ? [{ name: stateName, href: `/adopt/${stateCode.toLowerCase()}` }]
      : []),
    ...(stateCode && cityName && citySlug
      ? [
          {
            name: cityName,
            href: `/adopt/${stateCode.toLowerCase()}/${citySlug}`,
          },
        ]
      : []),
    { name: pet.name ?? "Pet" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="relative bg-background border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
          <Breadcrumbs items={crumbs} />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="order-2 lg:order-1 flex items-start">
              {hasImage ? (
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl bg-muted">
                  <Image
                    src={pet.image_urls![0]}
                    alt={
                      pet.name
                        ? `${pet.name}${pet.breed ? `, a ${pet.breed}` : ""}, available for adoption`
                        : "Adoptable pet photo"
                    }
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="w-full aspect-[4/3] flex items-center justify-center rounded-2xl bg-muted">
                  <Heart className="w-24 h-24 text-muted-foreground/30" />
                </div>
              )}
            </div>

            <div className="order-1 lg:order-2 space-y-6 lg:pt-8">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {pet.gender && (
                    <Badge variant="secondary" className="text-sm">
                      {pet.gender}
                    </Badge>
                  )}
                  {pet.age && (
                    <Badge variant="secondary" className="text-sm">
                      {pet.age}
                    </Badge>
                  )}
                  {pet.size && (
                    <Badge variant="secondary" className="text-sm">
                      {pet.size}
                    </Badge>
                  )}
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                  {pet.name}
                </h1>

                {pet.breed && (
                  <p className="text-xl text-muted-foreground">{pet.breed}</p>
                )}
              </div>

              {days !== null && (
                <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-900 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-red-900 dark:text-red-100 text-lg">
                        Urgent:{" "}
                        {days <= 0
                          ? "Last Day"
                          : days === 1
                            ? "1 Day Left"
                            : `${days} Days Left`}
                      </p>
                      {pet.euthanasia_date && (
                        <p className="text-sm text-red-800 dark:text-red-200 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          Scheduled:{" "}
                          {new Date(pet.euthanasia_date).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </p>
                      )}
                      {reason && (
                        <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                          Reason: {reason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {shelter && (
                <div className="flex flex-col sm:flex-row gap-3">
                  {shelter.phone_number && (
                    <Button asChild size="lg" className="flex-1">
                      <a href={`tel:${shelter.phone_number}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        Call Shelter
                      </a>
                    </Button>
                  )}
                  {shelter.email && (
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="flex-1"
                    >
                      <a href={`mailto:${shelter.email}`}>
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">About {pet.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-relaxed text-foreground/90">{summary}</p>
                {description && (
                  <>
                    <hr className="border-border" />
                    <p className="whitespace-pre-line leading-relaxed text-foreground/90">
                      {description}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <DetailItem label="Breed" value={pet.breed} href={breedHref} />
                  <DetailItem label="Age" value={pet.age} />
                  <DetailItem label="Gender" value={pet.gender} />
                  <DetailItem label="Size" value={pet.size} />
                  {pet.shelter_given_id && (
                    <DetailItem
                      label="Shelter ID"
                      value={pet.shelter_given_id}
                    />
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {shelter && (
              <ShelterContactCard
                shelter={shelter}
                href={shelterSlug ? `/shelters/${shelterSlug}` : undefined}
              />
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">How to Adopt</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm">
                  <AdoptionStep
                    n={1}
                    text={`Contact ${shelter?.name ?? "the shelter"} by phone or email`}
                  />
                  <AdoptionStep
                    n={2}
                    text="Ask about visitation hours and requirements"
                  />
                  <AdoptionStep
                    n={3}
                    text={`Schedule a visit to meet ${pet.name ?? "this pet"}`}
                  />
                  <AdoptionStep
                    n={4}
                    text="Complete the adoption application and interview"
                  />
                  <AdoptionStep
                    n={5}
                    text={`Finalize the adoption and bring ${pet.name ?? "your new pet"} home!`}
                  />
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>

        {similarPets.length > 0 && (
          <section className="mt-12 space-y-6 border-t pt-10">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-2xl font-bold">
                {breedName
                  ? `More ${breedName}s who need homes`
                  : "More pets who need homes"}
              </h2>
              {breedHref && (
                <Link
                  href={breedHref}
                  className="text-sm underline text-muted-foreground hover:text-foreground"
                >
                  See all adoptable {breedName}s
                </Link>
              )}
            </div>
            <HubPetGrid pets={similarPets} cap={4} />
          </section>
        )}
      </div>
    </div>
  )
}

function DetailItem({
  label,
  value,
  href,
}: {
  label: string
  value: string | null | undefined
  href?: string
}) {
  if (!value) return null
  return (
    <div className="space-y-1">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-base font-semibold">
        {href ? (
          <Link href={href} className="underline hover:text-primary">
            {value}
          </Link>
        ) : (
          value
        )}
      </dd>
    </div>
  )
}

function AdoptionStep({ n, text }: { n: number; text: string }) {
  return (
    <li className="flex gap-3">
      <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
        {n}
      </span>
      <span className="pt-0.5">{text}</span>
    </li>
  )
}
