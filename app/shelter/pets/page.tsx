"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { ShelterNavbar } from "@/components/ui/shelter-navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Plus, Search, Filter } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Fake data for testing
const pets = [
  {
    id: 1,
    name: "Max",
    breed: "Golden Retriever",
    age: 3,
    gender: "Male",
    euthanasiaDate: "2026-02-01", // Past due
    image: null,
  },
  {
    id: 2,
    name: "Bella",
    breed: "Labrador Mix",
    age: 2,
    gender: "Female",
    euthanasiaDate: "2026-03-20",
    image: null,
  },
  {
    id: 3,
    name: "Charlie",
    breed: "Beagle",
    age: 5,
    gender: "Male",
    euthanasiaDate: "2026-01-15", // Past due
    image: null,
  },
  {
    id: 4,
    name: "Luna",
    breed: "German Shepherd",
    age: 4,
    gender: "Female",
    euthanasiaDate: "2026-04-05",
    image: null,
  },
]

// Format date to "Month Day"
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' }
  return date.toLocaleDateString('en-US', options)
}

// Check if date is past due
function isPastDue(dateString: string): boolean {
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

export default function ShelterPetsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [genderFilter, setGenderFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  // Filter pets based on search and filters
  const filteredPets = useMemo(() => {
    return pets.filter((pet) => {
      const matchesSearch = pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           pet.breed.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesGender = genderFilter === "all" || pet.gender === genderFilter
      
      let matchesDate = true
      if (dateFilter === "past-due") {
        matchesDate = isPastDue(pet.euthanasiaDate)
      } else if (dateFilter === "upcoming") {
        matchesDate = !isPastDue(pet.euthanasiaDate)
      }
      
      return matchesSearch && matchesGender && matchesDate
    })
  }, [searchQuery, genderFilter, dateFilter])

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <ShelterNavbar />
      
      {/* Breadcrumb Section */}
      <div className="border-b">
        <div className="px-8 py-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/shelter/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>My Pets</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 py-6 overflow-auto">
        {/* Page Header with Add Button */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Pets</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your shelter&apos;s pet listings and information
            </p>
          </div>
          <Button className="bg-black hover:bg-black/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Pet
          </Button>
        </div>

        {/* Filters Section */}
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or breed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Gender:</span>
            <div className="flex gap-2">
              <Button
                variant={genderFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setGenderFilter("all")}
              >
                All
              </Button>
              <Button
                variant={genderFilter === "Male" ? "default" : "outline"}
                size="sm"
                onClick={() => setGenderFilter("Male")}
              >
                Male
              </Button>
              <Button
                variant={genderFilter === "Female" ? "default" : "outline"}
                size="sm"
                onClick={() => setGenderFilter("Female")}
              >
                Female
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Date:</span>
            <div className="flex gap-2">
              <Button
                variant={dateFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setDateFilter("all")}
              >
                All
              </Button>
              <Button
                variant={dateFilter === "past-due" ? "default" : "outline"}
                size="sm"
                onClick={() => setDateFilter("past-due")}
              >
                Action Required
              </Button>
              <Button
                variant={dateFilter === "upcoming" ? "default" : "outline"}
                size="sm"
                onClick={() => setDateFilter("upcoming")}
              >
                Upcoming
              </Button>
            </div>
          </div>
        </div>

        {/* Pets Table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium">Picture</th>
                <th className="text-left py-3 px-4 text-sm font-medium">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium">Breed</th>
                <th className="text-left py-3 px-4 text-sm font-medium">Age</th>
                <th className="text-left py-3 px-4 text-sm font-medium">Gender</th>
                <th className="text-left py-3 px-4 text-sm font-medium">Euthanasia Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    No pets found. {searchQuery || genderFilter !== "all" || dateFilter !== "all" ? "Try adjusting your filters." : "Click \"Add Pet\" to get started."}
                  </td>
                </tr>
              ) : (
                filteredPets.map((pet) => {
                  const pastDue = isPastDue(pet.euthanasiaDate)
                  return (
                    <tr 
                      key={pet.id} 
                      className={`border-b last:border-b-0 ${
                        pastDue 
                          ? "bg-orange-50 dark:bg-orange-950/10 hover:bg-orange-100 dark:hover:bg-orange-950/20" 
                          : "hover:bg-muted/30"
                      }`}
                    >
                      <td className="py-3 px-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={pet.image || undefined} alt={pet.name} />
                          <AvatarFallback>{pet.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </td>
                      <td className="py-3 px-4 font-medium">{pet.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{pet.breed}</td>
                      <td className="py-3 px-4 text-muted-foreground">{pet.age} years</td>
                      <td className="py-3 px-4 text-muted-foreground">{pet.gender}</td>
                      <td className={`py-3 px-4 ${pastDue ? "text-orange-600 dark:text-orange-400 font-medium" : "text-muted-foreground"}`}>
                        {formatDate(pet.euthanasiaDate)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
