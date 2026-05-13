"use client"

import * as React from "react"
import Link from "next/link"
import { Heart, HeartOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { PetCard } from "@/components/ui/pet-card"
import { useFavorites } from "@/lib/favorites-context"

export default function SavedPage() {
  const { favorites, isReady, clearFavorites } = useFavorites()

  return (
    <section className="w-full bg-background py-12 px-4 md:px-8 min-h-[70vh]">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500 fill-red-500" />
              Saved Pets
            </h1>
            <p className="mt-2 text-muted-foreground">
              Pets you&apos;ve hearted. Saved on this device.
            </p>
          </div>
          {favorites.length > 0 && (
            <Button
              variant="outline"
              className="text-muted-foreground"
              onClick={() => {
                if (
                  typeof window !== "undefined" &&
                  window.confirm(
                    "Remove all pets from your saved list on this device?",
                  )
                ) {
                  clearFavorites()
                }
              }}
              aria-label="Remove all pets from your saved list on this device"
            >
              <HeartOff className="w-4 h-4 mr-2" aria-hidden />
              Remove all from saved
            </Button>
          )}
        </div>

        <Separator />

        {!isReady ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading saved pets…
          </div>
        ) : favorites.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 space-y-4">
      <div className="rounded-full bg-muted p-6">
        <Heart className="w-12 h-12 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-semibold">No saved pets yet</h2>
      <p className="text-muted-foreground max-w-md">
        Tap the heart on any pet to save them here. Saved pets stay on this
        device so you can revisit them anytime.
      </p>
      <Button asChild size="lg">
        <Link href="/explore">Start exploring</Link>
      </Button>
    </div>
  )
}
