"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShelterNavbar } from "@/components/ui/shelter-navbar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getShelterProfile, updateShelterProfile } from "@/lib/server-actions"
import { Loader2 } from "lucide-react"

export default function ShelterProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    phone_number: "",
    email: "",
  })

  useEffect(() => {
    async function loadProfile() {
      try {
        const result = await getShelterProfile()
        if (result.ok) {
          setFormData({
            name: result.shelter.name || "",
            address: result.shelter.address || "",
            city: result.shelter.city || "",
            state: result.shelter.state || "",
            phone_number: result.shelter.phone_number || "",
            email: result.shelter.email || "",
          })
        } else {
          setMessage({ type: "error", text: result.error })
        }
      } catch (error) {
        setMessage({ type: "error", text: "Failed to load profile data" })
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const result = await updateShelterProfile(formData)
      if (result.ok) {
        setMessage({ type: "success", text: "Profile updated successfully!" })
      } else {
        setMessage({ type: "error", text: result.error })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save changes" })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

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
                <BreadcrumbPage>Profile</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 py-6 flex flex-col overflow-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your shelter&apos;s profile information and contact details
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
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

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between w-full">
              <div className="space-y-5">
                {/* Name Field */}
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-sm font-medium">
                    Shelter Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter shelter name"
                    className="h-10"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>

                {/* Address Field */}
                <div className="space-y-1.5">
                  <label htmlFor="address" className="text-sm font-medium">
                    Address
                  </label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Street address"
                    className="h-10"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                  />
                </div>

                {/* City and State Row */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="city" className="text-sm font-medium">
                      City
                    </label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="City"
                      className="h-10"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="state" className="text-sm font-medium">
                      State
                    </label>
                    <Input
                      id="state"
                      type="text"
                      placeholder="State"
                      className="h-10"
                      value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                    />
                  </div>
                </div>

                {/* Phone Number and Email Row */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="phone_number" className="text-sm font-medium">
                      Phone Number
                    </label>
                    <Input
                      id="phone_number"
                      type="tel"
                      placeholder="(555) 123-4567"
                      className="h-10"
                      value={formData.phone_number}
                      onChange={(e) => handleChange("phone_number", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@shelter.org"
                      className="h-10"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-5">
                <Button type="button" variant="outline" asChild>
                  <Link href="/shelter/dashboard">Cancel</Link>
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
