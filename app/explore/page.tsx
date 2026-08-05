import { ExplorePets } from "@/components/ui/explore/explore-pets"
import {
  getExploreBreedOptions,
  getExploreFacets,
  getExplorePage,
} from "@/lib/api/explore"
import { DEFAULT_EXPLORE_FILTERS } from "@/lib/explore-filters"

export const metadata = {
  // Root layout title template appends "— Petbound".
  title: "Explore Pets",
  description:
    "Browse pets at risk of euthanasia and find your life-saving match.",
  alternates: { canonical: "/explore" },
}

export default async function ExplorePage() {
  const [initial, breedOptions, facets] = await Promise.all([
    getExplorePage(0, DEFAULT_EXPLORE_FILTERS),
    getExploreBreedOptions(),
    getExploreFacets(),
  ])

  return (
    <ExplorePets
      initialPets={initial.pets}
      initialTotal={initial.total}
      initialTotalPages={initial.totalPages}
      breedOptions={breedOptions}
      facets={facets}
    />
  )
}
