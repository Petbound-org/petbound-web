"use client"

import * as React from "react"
import { PetCard, type Pet } from "@/components/ui/pet-card"

const pets: Pet[] = [
  { id: 1, name: "Bella", breed: "Golden Retriever", age: "2 yrs", image: "/images/pets/bella.jpg" },
  { id: 2, name: "Max", breed: "Beagle", age: "3 yrs", image: "/images/pets/max.jpg" },
  { id: 3, name: "Luna", breed: "Siamese Cat", age: "1 yr", image: "/images/pets/luna.jpg" },
  { id: 4, name: "Charlie", breed: "Bulldog", age: "4 yrs", image: "/images/pets/charlie.jpg" },
  { id: 5, name: "Milo", breed: "Tabby Cat", age: "2 yrs", image: "/images/pets/milo.jpg" },
  { id: 6, name: "Daisy", breed: "Labrador", age: "3 yrs", image: "/images/pets/daisy.jpg" },
  { id: 7, name: "Oliver", breed: "Corgi", age: "1 yr", image: "/images/pets/oliver.jpg" },
  { id: 8, name: "Chloe", breed: "Persian Cat", age: "2 yrs", image: "/images/pets/chloe.jpg" },
  { id: 9, name: "Rocky", breed: "Boxer", age: "3 yrs", image: "/images/pets/rocky.jpg" },
  { id: 10, name: "Lily", breed: "Husky", age: "1 yr", image: "/images/pets/lily.jpg" },
  { id: 11, name: "Leo", breed: "Ragdoll Cat", age: "2 yrs", image: "/images/pets/leo.jpg" },
  { id: 12, name: "Ruby", breed: "Shih Tzu", age: "4 yrs", image: "/images/pets/ruby.jpg" },
]

export function HeroPets() {
  // Limit pets rendered to max 3 rows (assuming 4 columns on lg screen)
  const maxRows = 3
  const maxColsLg = 4
  const visiblePets = pets.slice(0, maxRows * maxColsLg)

  return (
    <section className="relative w-full bg-gray-50 dark:bg-gray-900 py-12 pb-16 px-4 md:px-8">
      {/* Title */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">
          Meet Our Adorable Pets
        </h2>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
          These loving companions are waiting for a loving home
        </p>
      </div>

      {/* Pet Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {visiblePets.map((pet) => (
          <PetCard key={pet.id} pet={pet} />
        ))}
      </div>
    </section>
  )
}