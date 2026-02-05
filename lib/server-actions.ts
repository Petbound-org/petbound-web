"use server"

import { Pet } from "@/lib/types/pet.interface"
import { supabase } from "@/lib/supabaseClient"
import { createServerSupabaseClient } from "@/lib/supabaseServer"
import type { PetFilters } from "@/components/ui/explore/filter-sidebar"

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
    page_number: number = 0, // Using 0 as the default offset, meaning the first page
    filters?: PetFilters
): Promise<Pet[]> {

    const SB_LAT = 34.4208;
    const SB_LON = -119.6982;
    const limit = count ?? PETS_PER_PAGE;

    // 🛑 CRUCIAL CALCULATION: Convert page_number (offset) to row offset
    // If page_number is 0, pet_offset = 0 * 30 = 0 (first 30)
    // If page_number is 1, pet_offset = 1 * 30 = 30 (skips 30, returns 31-60)
    const pet_offset = page_number * limit;
    const age_filters = filters?.ages?.length ? filters.ages : null;
    const size_filters = filters?.sizes?.length ? filters.sizes : null;

    const { data: pets, error } = await supabase.rpc("get_nearby_pets_filtered", {
        user_lat: SB_LAT,
        user_lon: SB_LON,
        pet_limit: PETS_PER_PAGE,
        pet_offset,
        age_filters,
        size_filters,
    });

    // Checking to see if filter works
    if (error) {
        console.error("Server Action Error fetching pets:", error);
        return [];
    }

    console.log("filters received:", filters);
    return (pets ?? []) as Pet[];
}

export type CreateShelterProfileResult = { ok: true } | { ok: false; error: string }

/**
 * Creates a shelter profile linked to the current auth user.
 * Call after a shelter signs up (user must have user_metadata.role === 'shelter').
 * Requires the shelters table to have a user_id column (uuid, references auth.users).
 */
export async function createShelterProfile(
    name: string,
    phone?: string | null
): Promise<CreateShelterProfileResult> {
    const serverSupabase = await createServerSupabaseClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
        return { ok: false, error: "Not authenticated." }
    }

    const role = (user.user_metadata?.role as string) ?? ""
    if (role !== "shelter") {
        return { ok: false, error: "Only shelter accounts can create a shelter profile." }
    }

    const { data: existing } = await supabase
        .from("shelters")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle()

    if (existing) {
        return { ok: true }
    }

    const { error: insertError } = await supabase.from("shelters").insert({
        user_id: user.id,
        name: name.trim() || null,
        email: user.email ?? null,
        phone_number: phone?.trim() || null,
    })

    if (insertError) {
        return { ok: false, error: insertError.message }
    }

    return { ok: true }
}
