// src/components/HeroPets.tsx (Your existing Client Component)

"use client"

import * as React from "react"
import { PetCard } from "@/components/ui/pet-card"
import { Pet } from "@/lib/types/pet.interface"
import { Button } from "./button" // Assuming this is the correct path for your shadcn button

interface HeroPetsProps {
  initialPets: Pet[]
  totalNeeded: number // Passed from the Server Component
}

// Update the function signature to accept props
export function HeroPets({ initialPets, totalNeeded }: HeroPetsProps) {
  // Initialize the state with the data fetched on the server (SSR)
  const [pets, setPets] = React.useState<Pet[]>(initialPets)

  const visiblePets = pets.slice(0, totalNeeded)

  return (
    <section className="relative w-full bg-gray-50 dark:bg-gray-900 py-12 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">
          Meet Our Adorable Pets
        </h2>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
          These loving companions are waiting for a loving home
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {visiblePets.map((pet) => (
          <PetCard key={pet.id} pet={pet} />
        ))}
      </div>

      <div className="max-w-7xl mx-auto mt-12 flex justify-center">
        <Button size="lg" variant="default" asChild>
          <a href="/explore">Find More Pets</a>
        </Button>
      </div>
    </section>
  )
}