// app/explore/page.tsx

import { ExplorePets } from "@/components/ui/explore-pets"
import { getPets } from "@/lib/server-actions" // Use the new Server Action
import { Pet } from "@/lib/types/pet.interface"
// Note: Removed redundant supabase import as it's used only inside getPets

// Define the maximum number of pets to load initially on the Explore page
// Set to 30 to match the desired page size.
const INITIAL_LOAD_COUNT = 30 

// NOTE: The getPets implementation must be in src/lib/server-actions.ts
// and already includes the count and offset parameters.

export default async function ExplorePage() {
  // Fetch the first page of data securely on the server (offset is 0)
  const initialPets = await getPets(INITIAL_LOAD_COUNT, 0)

  return (
    // Pass the SSR-fetched data to the client component
    <ExplorePets initialPets={initialPets} initialCount={INITIAL_LOAD_COUNT} />
  )
}