"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useFavorites } from "@/lib/favorites-context"
import type { Pet } from "@/lib/types/pet.interface"

interface PetCardProps {
  pet: Pet
}

export function PetCard({ pet }: PetCardProps) {
  const { isFavorited, toggleFavorite } = useFavorites()
  const liked = isFavorited(pet.id)
  const [animating, setAnimating] = React.useState(false)

  const bumpAnimation = () => {
    setAnimating(true)
    window.setTimeout(() => setAnimating(false), 280)
  }

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!liked) bumpAnimation()
    toggleFavorite(pet)
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, a")) return
    if (!liked) {
      bumpAnimation()
      toggleFavorite(pet)
    }
  }

  const hasImage = pet.image_urls && pet.image_urls.length > 0

  return (
    <div
      className="group bg-card text-card-foreground border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
      onDoubleClick={handleDoubleClick}
    >
      <Link
        href={`/pets/${pet.id}`}
        className="relative h-48 w-full overflow-hidden block bg-muted"
        aria-label={`View ${pet.name ?? "pet"}`}
      >
        {hasImage ? (
          <Image
            src={pet.image_urls![0]}
            alt={pet.name ?? "Pet photo"}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Heart className="w-16 h-16 text-muted-foreground/40" />
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1 justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold tracking-tight truncate">
            {pet.name ?? "Unnamed Pet"}
          </h3>
          {pet.breed && (
            <p className="text-sm text-muted-foreground truncate">{pet.breed}</p>
          )}
          {pet.age && (
            <p className="text-sm text-muted-foreground">{pet.age}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="default" className="flex-1" asChild>
            <Link href={`/pets/${pet.id}`}>More Info</Link>
          </Button>
          <Button
            variant="outline"
            className="p-2 flex items-center justify-center"
            onClick={handleLike}
            aria-pressed={liked}
            aria-label={liked ? "Remove from saved" : "Save pet"}
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-transform duration-300",
                liked
                  ? "text-red-500 fill-red-500"
                  : "text-muted-foreground fill-transparent",
                animating && "scale-125",
              )}
            />
          </Button>
        </div>
      </div>
    </div>
  )
}
