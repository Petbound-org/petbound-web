import { HeroPets } from "./hero-pets"
import { getNearbyPets } from "@/lib/api/pets"

/**
 * Server component wrapper around the homepage pet grid.
 * `getNearbyPets` is uncached + `noStore()` so an empty grid retries on every visit.
 */
export async function HeroPetsContainer() {
  const totalNeeded = 12

  const initialPets = await getNearbyPets(totalNeeded)

  return <HeroPets initialPets={initialPets} totalNeeded={totalNeeded} />
}
