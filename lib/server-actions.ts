"use server"

import { Pet } from "@/lib/types/pet.interface"
import { supabase } from "@/lib/supabaseClient"

// Define the page size constant here as well, so the calculation is centralized
const PETS_PER_PAGE = 30; 

/**
 * Fetches a paginated list of pets using a page number (0-indexed or 1-indexed).
 * * @param page_number The page index (0 for first page, 1 for second page, etc.).
 * @param count The number of pets per page (fixed at 30).
 * @returns A promise resolving to an array of Pet objects.
 */
export async function getPets(
  count: number, // Still required for the RPC signature
  page_number: number = 0 // Using 0 as the default offset, meaning the first page
): Promise<Pet[]> {
  
  const SB_LAT = 34.4208;
  const SB_LON = -119.6982;

  // 🛑 CRUCIAL CALCULATION: Convert page_number (offset) to row offset
  // If page_number is 0, pet_offset = 0 * 30 = 0 (first 30)
  // If page_number is 1, pet_offset = 1 * 30 = 30 (skips 30, returns 31-60)
  const pet_offset = page_number * PETS_PER_PAGE;

  const { data: pets, error } = await supabase.rpc("get_nearby_pets", {
    user_lat: SB_LAT,
    user_lon: SB_LON,
    pet_limit: PETS_PER_PAGE, // Use the constant
    pet_offset: pet_offset,  // Use the calculated row offset
  });

  if (error) {
    console.error("Server Action Error fetching pets:", error);
    return [];
  }

  return pets as Pet[];
}