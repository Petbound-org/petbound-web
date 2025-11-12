"use client"

import * as React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

export type Pet = {
  id: number
  name: string
  breed: string
  age: string
  image: string
}

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
      <div className="relative h-48 w-full">
        <Image
          src={pet.image}
          alt={pet.name}
          fill
          className="object-cover"
        />
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
          <Button variant="default" className="flex-1">
            More Info
          </Button>
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
