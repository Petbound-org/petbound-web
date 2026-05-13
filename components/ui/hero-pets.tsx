"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { PetCard } from "@/components/ui/pet-card"
import type { Pet } from "@/lib/types/pet.interface"

interface HeroPetsProps {
  initialPets: Pet[]
  totalNeeded: number
}

export function HeroPets({ initialPets, totalNeeded }: HeroPetsProps) {
  const visiblePets = initialPets.slice(0, totalNeeded)

  return (
    <section className="relative w-full bg-muted/40 py-12 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
          Meet Our Adorable Pets
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          These loving companions are waiting for a loving home
        </p>
      </div>

      {visiblePets.length === 0 ? (
        <div className="max-w-md mx-auto text-center text-muted-foreground">
          No pets available right now. Check back soon!
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {visiblePets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}

      <div className="max-w-7xl mx-auto mt-12 flex justify-center">
        <Button size="lg" asChild>
          <Link href="/explore">Find More Pets</Link>
        </Button>
      </div>
    </section>
  )
}
