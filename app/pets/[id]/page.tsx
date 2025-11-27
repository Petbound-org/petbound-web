import { supabase } from '@/lib/supabaseClient'
import { Pet } from "@/lib/types/pet.interface"
import { Shelter } from "@/lib/types/shelter.interface"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Mail, Phone, MapPin, Calendar, Heart } from "lucide-react"

async function getPetData(id: number) {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

async function getShelterData(id: number) {
  const { data, error } = await supabase
    .from('shelters')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

function daysLeft(dateStr: string | null): number | null {
  if (!dateStr) return null
  const target = new Date(dateStr).getTime()
  const now = Date.now()
  const diff = target - now
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default async function PetPage(props: any) {
  const { id } = await props.params
  const pet: Pet | null = await getPetData(id)
  if (!pet) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-background to-muted/20 p-4">
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
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                The pet you're looking for doesn't exist or may have been adopted already.
              </p>
            </div>
            <div className="pt-2">
              <Button asChild className="w-full">
                <a href="/">
                  <Heart className="w-4 h-4 mr-2" />
                  Browse Available Pets
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const shelter = pet.shelter_id ? await getShelterData(pet.shelter_id) : null
  const days = daysLeft(pet.euthanasia_date)

  // Improving pet description
  if (pet.description?.startsWith("***** AVAILABLE FOR ADOPTION NOW ***** "))
    pet.description = pet.description.substring(39)

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      {/* HERO SECTION */}
      <div className="relative bg-background border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            
            {/* LEFT: Image */}
            <div className="order-2 lg:order-1 flex items-start">
              {pet.image_urls && pet.image_urls.length > 0 ? (
                <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl bg-muted" style={{ maxHeight: '500px' }}>
                  <img
                    src={pet.image_urls[0]}
                    alt={pet.name || "Pet photo"}
                    className="w-full h-full object-cover"
                    style={{ maxHeight: '450px' }}
                  />
                </div>
              ) : (
                <div className="w-full flex items-center justify-center rounded-2xl bg-muted" style={{ height: '500px' }}>
                  <Heart className="w-24 h-24 text-muted-foreground/30" />
                </div>
              )}
            </div>

            {/* RIGHT: Pet Info */}
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
                  <p className="text-xl text-muted-foreground">
                    {pet.breed}
                  </p>
                )}
              </div>

              {/* Euthanasia Alert */}
              {days !== null && (
                <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-900 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-red-900 dark:text-red-100 text-lg">
                        Urgent: {days === 0 ? "Last Day" : days === 1 ? "1 Day Left" : `${days} Days Left`}
                      </p>
                      {pet.euthanasia_date && (
                        <p className="text-sm text-red-800 dark:text-red-200 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          Scheduled: {new Date(pet.euthanasia_date).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </p>
                      )}
                      {pet.euthanasia_reason && (
                        <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                          {pet.euthanasia_reason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Contact */}
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
                    <Button asChild size="lg" variant="outline" className="flex-1">
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

      {/* MAIN CONTENT */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">About {pet.name} ♡</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm sm:prose-base max-w-none">
                  <p className="whitespace-pre-line leading-relaxed">
                    {pet.description || "No description available."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Details */}
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
                    <DetailItem label="Shelter ID" value={pet.shelter_given_id} />
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN - 1/3 width */}
          <div className="space-y-6">
            
            {/* Shelter Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{shelter.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {shelter ? (
                  <>
                    <div className="space-y-3">
                      {(shelter.address || shelter.city || shelter.state) && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([shelter.address, shelter.city, shelter.state].filter(Boolean).join(', '))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {shelter.address && <div>{shelter.address}</div>}
                            {(shelter.city || shelter.state) && (
                              <div>{[shelter.city, shelter.state].filter(Boolean).join(', ')}</div>
                            )}
                          </a>
                        </div>
                      )}

                      {shelter.phone_number && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <a href={`tel:${shelter.phone_number}`} className="hover:underline">
                            {shelter.phone_number}
                          </a>
                        </div>
                      )}

                      {shelter.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <a href={`mailto:${shelter.email}`} className="hover:underline break-all">
                            {shelter.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No shelter information available.</p>
                )}
              </CardContent>
            </Card>

            {/* Adoption Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">How to Adopt</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      1
                    </span>
                    <span className="pt-0.5">Contact the shelter using phone or email</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      2
                    </span>
                    <span className="pt-0.5">Ask about visitation hours and requirements</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      3
                    </span>
                    <span className="pt-0.5">Schedule a visit to meet {pet.name}</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      4
                    </span>
                    <span className="pt-0.5">Complete adoption application and interview</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      5
                    </span>
                    <span className="pt-0.5">Finalize adoption and bring {pet.name} home!</span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: any }) {
  if (!value) return null
  return (
    <div className="space-y-1">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-base font-semibold">{value}</dd>
    </div>
  )
}