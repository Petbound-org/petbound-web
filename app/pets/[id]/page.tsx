import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Mail, Phone, MapPin, Calendar, Heart } from "lucide-react"

import { getPetById } from "@/lib/api/pets"
import { getShelterById } from "@/lib/api/shelters"

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
  const { id } = await params
  const petId = Number(id)
  if (!Number.isFinite(petId)) {
    return { title: "Pet — Petbound" }
  }
  const pet = await getPetById(petId)
  if (!pet) {
    return { title: "Pet Not Found — Petbound" }
  }
  return {
    title: `${pet.name ?? "Pet"} — Petbound`,
    description:
      pet.description?.slice(0, 160) ??
      `Help adopt ${pet.name ?? "this pet"} before time runs out.`,
  }
}

export default async function PetPage({ params }: PetPageProps) {
  const { id } = await params
  const petId = Number(id)

  if (!Number.isFinite(petId)) {
    notFound()
  }

  const pet = await getPetById(petId)

  if (!pet) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              <div className="rounded-full bg-muted p-4">
                <AlertCircle className="w-12 h-12 text-muted-foreground" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-bold tracking-tight">404</h1>
                <p className="text-xl font-semibold">Pet Not Found</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              The pet you&apos;re looking for doesn&apos;t exist or may have been adopted already.
            </p>
            <Button asChild className="w-full">
              <Link href="/explore">
                <Heart className="w-4 h-4 mr-2" />
                Browse Available Pets
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const shelter = pet.shelter_id ? await getShelterById(pet.shelter_id) : null
  const days = daysLeft(pet.euthanasia_date)
  const description = cleanDescription(pet.description)
  const reason = cleanEuthanasiaReason(pet.euthanasia_reason)
  const hasImage = Boolean(pet.image_urls && pet.image_urls.length > 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="relative bg-background border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="order-2 lg:order-1 flex items-start">
              {hasImage ? (
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl bg-muted">
                  <Image
                    src={pet.image_urls![0]}
                    alt={pet.name ?? "Pet photo"}
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
              <CardContent>
                <p className="whitespace-pre-line leading-relaxed text-foreground/90">
                  {description || "No description available."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <DetailItem label="Breed" value={pet.breed} />
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    {shelter.name ?? "Partner Shelter"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {(shelter.address || shelter.city || shelter.state) && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            [shelter.address, shelter.city, shelter.state]
                              .filter(Boolean)
                              .join(", "),
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {shelter.address && <div>{shelter.address}</div>}
                          {(shelter.city || shelter.state) && (
                            <div>
                              {[shelter.city, shelter.state]
                                .filter(Boolean)
                                .join(", ")}
                            </div>
                          )}
                        </a>
                      </div>
                    )}

                    {shelter.phone_number && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <a
                          href={`tel:${shelter.phone_number}`}
                          className="hover:underline"
                        >
                          {shelter.phone_number}
                        </a>
                      </div>
                    )}

                    {shelter.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <a
                          href={`mailto:${shelter.email}`}
                          className="hover:underline break-all"
                        >
                          {shelter.email}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">How to Adopt</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm">
                  <AdoptionStep n={1} text="Contact the shelter using phone or email" />
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
      </div>
    </div>
  )
}

function DetailItem({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  if (!value) return null
  return (
    <div className="space-y-1">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-base font-semibold">{value}</dd>
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
