"use server"

import { Pet } from "@/lib/types/pet.interface"
import { Shelter } from "@/lib/types/shelter.interface"
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

export type ShelterProfileResult = 
    | { ok: true; shelter: Shelter }
    | { ok: false; error: string }

/**
 * Fetches the shelter profile for the currently authenticated user.
 * Returns the shelter data if found, or an error if not authenticated or no shelter profile exists.
 */
export async function getShelterProfile(): Promise<ShelterProfileResult> {
    const serverSupabase = await createServerSupabaseClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
        return { ok: false, error: "Not authenticated." }
    }

    const { data: shelter, error } = await supabase
        .from("shelters")
        .select("*")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle()

    if (error) {
        return { ok: false, error: error.message }
    }

    if (!shelter) {
        return { ok: false, error: "No shelter profile found." }
    }

    return { ok: true, shelter: shelter as Shelter }
}

export type UpdateShelterProfileData = {
    name?: string
    address?: string
    city?: string
    state?: string
    phone_number?: string
    email?: string
}

export type UpdateShelterProfileResult = { ok: true } | { ok: false; error: string }

/**
 * Updates the shelter profile for the currently authenticated user.
 */
export async function updateShelterProfile(
    data: UpdateShelterProfileData
): Promise<UpdateShelterProfileResult> {
    const serverSupabase = await createServerSupabaseClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
        return { ok: false, error: "Not authenticated." }
    }

    const { data: shelter } = await supabase
        .from("shelters")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle()

    if (!shelter) {
        return { ok: false, error: "No shelter profile found." }
    }

    const { error: updateError } = await supabase
        .from("shelters")
        .update(data)
        .eq("id", shelter.id)

    if (updateError) {
        return { ok: false, error: updateError.message }
    }

    return { ok: true }
}

export type ShelterPetsResult = 
    | { ok: true; pets: Pet[] }
    | { ok: false; error: string }

/**
 * Fetches all pets belonging to the currently authenticated shelter.
 */
export async function getShelterPets(): Promise<ShelterPetsResult> {
    const serverSupabase = await createServerSupabaseClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
        return { ok: false, error: "Not authenticated." }
    }

    const { data: shelter } = await supabase
        .from("shelters")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle()

    if (!shelter) {
        return { ok: false, error: "No shelter profile found." }
    }

    const { data: pets, error } = await supabase
        .from("pets")
        .select("*")
        .eq("shelter_id", shelter.id)
        .order("created_at", { ascending: false })

    if (error) {
        return { ok: false, error: error.message }
    }

    return { ok: true, pets: (pets ?? []) as Pet[] }
}

export type CreatePetData = {
    name: string
    breed?: string
    age?: string
    gender?: string
    size?: string
    description?: string
    euthanasia_date?: string
    euthanasia_reason?: string
    image_urls?: string[]
    shelter_given_id?: string
}

export type CreatePetResult = 
    | { ok: true; pet: Pet }
    | { ok: false; error: string }

/**
 * Creates a new pet for the currently authenticated shelter.
 */
export async function createPet(petData: CreatePetData): Promise<CreatePetResult> {
    const serverSupabase = await createServerSupabaseClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
        return { ok: false, error: "Not authenticated." }
    }

    const { data: shelter } = await supabase
        .from("shelters")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle()

    if (!shelter) {
        return { ok: false, error: "No shelter profile found." }
    }

    const { data: pet, error } = await supabase
        .from("pets")
        .insert({
            ...petData,
            shelter_id: shelter.id,
        })
        .select()
        .single()

    if (error) {
        return { ok: false, error: error.message }
    }

    return { ok: true, pet: pet as Pet }
}

export type UpdatePetData = Partial<CreatePetData>

export type UpdatePetResult = { ok: true } | { ok: false; error: string }

/**
 * Updates an existing pet. Verifies that the pet belongs to the authenticated shelter.
 */
export async function updatePet(
    petId: number,
    petData: UpdatePetData
): Promise<UpdatePetResult> {
    const serverSupabase = await createServerSupabaseClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
        return { ok: false, error: "Not authenticated." }
    }

    const { data: shelter } = await supabase
        .from("shelters")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle()

    if (!shelter) {
        return { ok: false, error: "No shelter profile found." }
    }

    // Verify ownership
    const { data: pet } = await supabase
        .from("pets")
        .select("shelter_id")
        .eq("id", petId)
        .limit(1)
        .maybeSingle()

    if (!pet || pet.shelter_id !== shelter.id) {
        return { ok: false, error: "Pet not found or access denied." }
    }

    const { error: updateError } = await supabase
        .from("pets")
        .update(petData)
        .eq("id", petId)

    if (updateError) {
        return { ok: false, error: updateError.message }
    }

    return { ok: true }
}

export type DeletePetResult = { ok: true } | { ok: false; error: string }

/**
 * Deletes a pet. Verifies that the pet belongs to the authenticated shelter.
 */
export async function deletePet(petId: number): Promise<DeletePetResult> {
    const serverSupabase = await createServerSupabaseClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
        return { ok: false, error: "Not authenticated." }
    }

    const { data: shelter } = await supabase
        .from("shelters")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle()

    if (!shelter) {
        return { ok: false, error: "No shelter profile found." }
    }

    // Verify ownership
    const { data: pet } = await supabase
        .from("pets")
        .select("shelter_id")
        .eq("id", petId)
        .limit(1)
        .maybeSingle()

    if (!pet || pet.shelter_id !== shelter.id) {
        return { ok: false, error: "Pet not found or access denied." }
    }

    const { error: deleteError } = await supabase
        .from("pets")
        .delete()
        .eq("id", petId)

    if (deleteError) {
        return { ok: false, error: deleteError.message }
    }

    return { ok: true }
}
