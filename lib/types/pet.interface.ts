export interface Pet {
  id: number,
  name: string | null,
  breed: string | null,
  age: string | null,
  gender: string | null,
  size: string | null,
  description: string | null,
  euthanasia_date: string | null,
  image_urls: string[] | null,
  shelter_id: number | null,
  created_at: string | null,
  updated_at: string | null,
  shelter_given_id: string | null,
  euthanasia_reason: string | null,
}

/**
 * A pet as it appears in any list or grid.
 *
 * The live-pet index (`getLivePets`) does not select `description`: it is ~800KB
 * across the live set and no list view reads it, which kept the cached entry
 * near the ~2MB unstable_cache ceiling. Only the detail page, which fetches a
 * single row, has the full `Pet`.
 */
export type ListPet = Omit<Pet, "description">
