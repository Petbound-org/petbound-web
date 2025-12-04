// src/components/HeroPetsContainer.tsx (This is a Server Component)

import { HeroPets } from "./hero-pets" 
import { Pet } from "@/lib/types/pet.interface"
import { supabase } from "@/lib/supabaseClient"

// Fix to prevent data for being cached for too long
// to the point where it is outdated.
export const revalidate = 86400;

// The SQL function definition is assumed to be deployed in Supabase.
// It is now an async Server Action/Function.
async function getPets(count: number): Promise<Pet[]> {
  const SB_LAT = 34.4208 // User's Latitude
  const SB_LON = -119.6982 // User's Longitude

  // 1. Fetch data from the database using the optimized RPC function
  const { data: pets, error } = await supabase.rpc(
    "get_nearby_pets",
    {
      user_lat: SB_LAT,
      user_lon: SB_LON,
      pet_limit: count,
    }
  )

  if (error) {
    console.error("Error fetching nearby pets:", error)
    // Handle the error gracefully, maybe return an empty array
    return []
  }

  return pets as Pet[]
}

export async function HeroPetsContainer() {
  const maxRows = 3
  const maxColsLg = 4
  const totalNeeded = maxRows * maxColsLg

  // 2. Fetch the data directly here (SSR)
  const initialPets = await getPets(totalNeeded)

  // 3. Pass the fetched data as a prop to the Client Component
  return (
    <HeroPets initialPets={initialPets} totalNeeded={totalNeeded} />
  )
}