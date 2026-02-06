"use client"

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

export default function ShelterProfilePage() {
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
      <div className="flex-1 px-8 py-6 flex flex-col">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your shelter&apos;s profile information and contact details
          </p>
        </div>

        {/* Profile Form */}
        <form className="flex-1 flex flex-col justify-between w-full">
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
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-5">
            <Button type="button" variant="outline" asChild>
              <Link href="/shelter/dashboard">Cancel</Link>
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
