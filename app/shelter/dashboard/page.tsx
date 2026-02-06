"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShelterNavbar } from "@/components/ui/shelter-navbar"
import { Building2, PawPrint, AlertCircle, Loader2, User, Settings } from "lucide-react"
import { getShelterProfile, getShelterPets } from "@/lib/server-actions"
import type { Pet } from "@/lib/types/pet.interface"

// Check if date is past due
function isPastDue(dateString: string | null): boolean {
  if (!dateString) return false
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

export default function ShelterDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [shelterName, setShelterName] = useState<string>("")
  const [totalPets, setTotalPets] = useState(0)
  const [actionRequiredCount, setActionRequiredCount] = useState(0)
  const [recentPets, setRecentPets] = useState<Pet[]>([])

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true)
        
        // Fetch shelter profile
        const profileResult = await getShelterProfile()
        if (profileResult.ok) {
          setShelterName(profileResult.shelter.name || "Your Shelter")
        }

        // Fetch pets
        const petsResult = await getShelterPets()
        if (petsResult.ok) {
          const pets = petsResult.pets
          setTotalPets(pets.length)
          
          // Count pets with past due euthanasia dates
          const pastDueCount = pets.filter(pet => isPastDue(pet.euthanasia_date)).length
          setActionRequiredCount(pastDueCount)
          
          // Get last 5 pets added
          setRecentPets(pets.slice(0, 5))
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <ShelterNavbar />
      
      <div className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">
                {loading ? "Loading..." : `Welcome, ${shelterName}`}
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your shelter&apos;s pet listings and profile
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pets</CardTitle>
                    <PawPrint className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalPets}</div>
                    <p className="text-xs text-muted-foreground">
                      Active pet listings
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Action Required</CardTitle>
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{actionRequiredCount}</div>
                    <p className="text-xs text-muted-foreground">
                      Pets with past due dates
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button asChild variant="outline" className="w-full" size="sm">
                      <Link href="/shelter/pets">
                        <PawPrint className="h-4 w-4 mr-2" />
                        Manage Pets
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full" size="sm">
                      <Link href="/shelter/profile">
                        <User className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Pets */}
              {recentPets.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Pets</CardTitle>
                    <CardDescription>
                      Your most recently added pets
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentPets.map((pet) => (
                        <div
                          key={pet.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              <PawPrint className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{pet.name || "Unnamed"}</p>
                              <p className="text-sm text-muted-foreground">
                                {pet.breed || "Unknown breed"} • {pet.age || "Unknown age"}
                              </p>
                            </div>
                          </div>
                          {isPastDue(pet.euthanasia_date) && (
                            <span className="text-xs bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-full">
                              Action Required
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button asChild variant="outline" className="w-full mt-4">
                      <Link href="/shelter/pets">View All Pets</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {totalPets === 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Get Started</CardTitle>
                    <CardDescription>
                      You haven&apos;t added any pets yet
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Add your first pet to start managing your shelter&apos;s listings.
                    </p>
                    <Button asChild>
                      <Link href="/shelter/pets">
                        <PawPrint className="h-4 w-4 mr-2" />
                        Add Your First Pet
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
