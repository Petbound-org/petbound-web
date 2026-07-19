import Link from "next/link"

import { Button } from "@/components/ui/button"
import { PetCard } from "@/components/ui/pet-card"

import type { Pet } from "@/lib/types/pet.interface"

/**
 * Pet grid for hub pages. Caps the number of cards (hubs are landing pages,
 * not infinite feeds) and offers a "see all" CTA when the list is truncated.
 */
export function HubPetGrid({
  pets,
  cap = 24,
  seeAllHref = "/explore",
  seeAllLabel = "See all pets in Explore",
}: {
  pets: Pet[]
  cap?: number
  seeAllHref?: string
  seeAllLabel?: string
}) {
  const visible = pets.slice(0, cap)

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visible.map((pet) => (
          <PetCard key={pet.id} pet={pet} />
        ))}
      </div>
      {pets.length > visible.length && (
        <div className="flex justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href={seeAllHref}>{seeAllLabel}</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
