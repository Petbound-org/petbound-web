"use client"

import { useState, useMemo, useEffect } from "react"
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
import { Plus, Search, Filter, X, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getShelterPets, createPet } from "@/lib/server-actions"
import type { Pet } from "@/lib/types/pet.interface"

// Format date to "Month Day"
function formatDate(dateString: string | null): string {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' }
  return date.toLocaleDateString('en-US', options)
}

// Check if date is past due
function isPastDue(dateString: string | null): boolean {
  if (!dateString) return false
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

export default function ShelterPetsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [genderFilter, setGenderFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [newPetForm, setNewPetForm] = useState({
    name: "",
    breed: "",
    age: "",
    gender: "",
    size: "",
    description: "",
    euthanasia_date: "",
    euthanasia_reason: "",
    shelter_given_id: "",
  })

  useEffect(() => {
    loadPets()
  }, [])

  const loadPets = async () => {
    try {
      setLoading(true)
      const result = await getShelterPets()
      if (result.ok) {
        setPets(result.pets)
      } else {
        setMessage({ type: "error", text: result.error })
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load pets" })
    } finally {
      setLoading(false)
    }
  }

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const result = await createPet({
        name: newPetForm.name,
        breed: newPetForm.breed || undefined,
        age: newPetForm.age || undefined,
        gender: newPetForm.gender || undefined,
        size: newPetForm.size || undefined,
        description: newPetForm.description || undefined,
        euthanasia_date: newPetForm.euthanasia_date || undefined,
        euthanasia_reason: newPetForm.euthanasia_reason || undefined,
        shelter_given_id: newPetForm.shelter_given_id || undefined,
      })

      if (result.ok) {
        setMessage({ type: "success", text: "Pet added successfully!" })
        setShowAddModal(false)
        setNewPetForm({
          name: "",
          breed: "",
          age: "",
          gender: "",
          size: "",
          description: "",
          euthanasia_date: "",
          euthanasia_reason: "",
          shelter_given_id: "",
        })
        await loadPets()
      } else {
        setMessage({ type: "error", text: result.error })
      }
    } catch {
      setMessage({ type: "error", text: "Failed to add pet" })
    } finally {
      setSaving(false)
    }
  }

  // Filter pets based on search and filters
  const filteredPets = useMemo(() => {
    return pets.filter((pet) => {
      const matchesSearch = 
        (pet.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (pet.breed?.toLowerCase() || "").includes(searchQuery.toLowerCase())
      const matchesGender = genderFilter === "all" || pet.gender === genderFilter
      
      let matchesDate = true
      if (dateFilter === "past-due") {
        matchesDate = isPastDue(pet.euthanasia_date)
      } else if (dateFilter === "upcoming") {
        matchesDate = !isPastDue(pet.euthanasia_date)
      }
      
      return matchesSearch && matchesGender && matchesDate
    })
  }, [pets, searchQuery, genderFilter, dateFilter])

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
        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-900"
                : "bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Page Header with Add Button */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Pets</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your shelter&apos;s pet listings and information
            </p>
          </div>
          <Button 
            className="bg-black hover:bg-black/90 text-white"
            onClick={() => setShowAddModal(true)}
          >
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
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
                    const pastDue = isPastDue(pet.euthanasia_date)
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
                            <AvatarImage 
                              src={pet.image_urls?.[0] || undefined} 
                              alt={pet.name || "Pet"} 
                            />
                            <AvatarFallback>
                              {pet.name?.charAt(0).toUpperCase() || "P"}
                            </AvatarFallback>
                          </Avatar>
                        </td>
                        <td className="py-3 px-4 font-medium">{pet.name || "N/A"}</td>
                        <td className="py-3 px-4 text-muted-foreground">{pet.breed || "N/A"}</td>
                        <td className="py-3 px-4 text-muted-foreground">{pet.age || "N/A"}</td>
                        <td className="py-3 px-4 text-muted-foreground">{pet.gender || "N/A"}</td>
                        <td className={`py-3 px-4 ${pastDue ? "text-orange-600 dark:text-orange-400 font-medium" : "text-muted-foreground"}`}>
                          {formatDate(pet.euthanasia_date)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Pet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto m-4">
            <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Add New Pet</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddPet} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="pet-name" className="text-sm font-medium">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="pet-name"
                    required
                    value={newPetForm.name}
                    onChange={(e) => setNewPetForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter pet name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="pet-breed" className="text-sm font-medium">
                    Breed
                  </label>
                  <Input
                    id="pet-breed"
                    value={newPetForm.breed}
                    onChange={(e) => setNewPetForm(prev => ({ ...prev, breed: e.target.value }))}
                    placeholder="Enter breed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="pet-age" className="text-sm font-medium">
                    Age
                  </label>
                  <Input
                    id="pet-age"
                    value={newPetForm.age}
                    onChange={(e) => setNewPetForm(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="e.g., 2 years"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="pet-gender" className="text-sm font-medium">
                    Gender
                  </label>
                  <select
                    id="pet-gender"
                    value={newPetForm.gender}
                    onChange={(e) => setNewPetForm(prev => ({ ...prev, gender: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="pet-size" className="text-sm font-medium">
                    Size
                  </label>
                  <select
                    id="pet-size"
                    value={newPetForm.size}
                    onChange={(e) => setNewPetForm(prev => ({ ...prev, size: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select size</option>
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="pet-description" className="text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="pet-description"
                  value={newPetForm.description}
                  onChange={(e) => setNewPetForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter pet description"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="pet-euthanasia-date" className="text-sm font-medium">
                    Euthanasia Date
                  </label>
                  <Input
                    id="pet-euthanasia-date"
                    type="date"
                    value={newPetForm.euthanasia_date}
                    onChange={(e) => setNewPetForm(prev => ({ ...prev, euthanasia_date: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="pet-shelter-id" className="text-sm font-medium">
                    Shelter Given ID
                  </label>
                  <Input
                    id="pet-shelter-id"
                    value={newPetForm.shelter_given_id}
                    onChange={(e) => setNewPetForm(prev => ({ ...prev, shelter_given_id: e.target.value }))}
                    placeholder="Internal ID"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="pet-euthanasia-reason" className="text-sm font-medium">
                  Euthanasia Reason
                </label>
                <Input
                  id="pet-euthanasia-reason"
                  value={newPetForm.euthanasia_reason}
                  onChange={(e) => setNewPetForm(prev => ({ ...prev, euthanasia_reason: e.target.value }))}
                  placeholder="Enter reason if applicable"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Pet"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
