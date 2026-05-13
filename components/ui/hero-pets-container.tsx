import { HeroPets } from "./hero-pets"
import { getNearbyPets } from "@/lib/api/pets"

/**
 * Server component wrapper around the homepage pet grid.
 * Uses the cached `getNearbyPets` data layer — invalidation is handled by tags.
 */
export async function HeroPetsContainer() {
  const totalNeeded = 12

  const initialPets = await getNearbyPets(totalNeeded)

  return <HeroPets initialPets={initialPets} totalNeeded={totalNeeded} />
}
