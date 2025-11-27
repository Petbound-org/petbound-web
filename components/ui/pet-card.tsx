"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { Pet } from "@/lib/types/pet.interface"

type PetCardProps = {
  pet: Pet
}

export function PetCard({ pet }: PetCardProps) {
  const [liked, setLiked] = React.useState(false)
  const [animating, setAnimating] = React.useState(false)

  const handleLike = () => {
    if (!liked) {
      // Only animate when liking
      setAnimating(true)
      setTimeout(() => setAnimating(false), 300)
    }
    setLiked(!liked)
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Prevent triggering if clicked on a button inside the card
    if ((e.target as HTMLElement).closest("button")) return
    if (!liked) {
      setLiked(true)
      setAnimating(true)
      setTimeout(() => setAnimating(false), 300)
    }
  }

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex flex-col cursor-pointer"
      onDoubleClick={handleDoubleClick}
    >
      {/* Pet image */}
      <div className="relative h-48 w-full overflow-hidden">
        {pet.image_urls && pet.image_urls.length > 0 ? (
          <img
            src={pet.image_urls[0]}
            alt={pet.name || "Pet photo"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
            <Heart className="w-16 h-16 text-gray-400 dark:text-gray-500" />
          </div>
        )}
      </div>

      {/* Pet details */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {pet.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{pet.breed}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{pet.age}</p>
        </div>

        {/* Buttons */}
        <div className="mt-4 flex items-center gap-2">
          <Link href={`/pets/${pet.id}`} className="flex-1">
            <Button variant="default" className="w-full">
              More Info
            </Button>
          </Link>
          <Button
            variant="outline"
            className="p-2 flex items-center justify-center"
            onClick={handleLike}
          >
            <Heart
              className={`h-5 w-5 transition-transform duration-300 ${
                liked ? "text-red-500 fill-red-500" : "text-gray-400 dark:text-gray-300 fill-transparent"
              } ${animating ? "scale-125" : "scale-100"}`}
            />
          </Button>
        </div>
      </div>
    </div>
  )
}