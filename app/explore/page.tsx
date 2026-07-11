import { ExplorePets } from "@/components/ui/explore/explore-pets"
import { getPets } from "@/lib/api/pets"

export const metadata = {
  // Root layout title template appends "— Petbound".
  title: "Explore Pets",
  description:
    "Browse pets at risk of euthanasia and find your life-saving match.",
  alternates: { canonical: "/explore" },
}

export default async function ExplorePage() {
  const initialPets = await getPets(0, {})

  return <ExplorePets initialPets={initialPets} />
}
