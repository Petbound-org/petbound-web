import { ExplorePets } from "@/components/ui/explore/explore-pets"
import { getPets } from "@/lib/api/pets"

export const metadata = {
  title: "Explore Pets — Petbound",
  description:
    "Browse pets at risk of euthanasia and find your life-saving match.",
}

export default async function ExplorePage() {
  const initialPets = await getPets(0, {})

  return <ExplorePets initialPets={initialPets} />
}
