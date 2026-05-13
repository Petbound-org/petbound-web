"use client"

import * as React from "react"

import type { Pet } from "@/lib/types/pet.interface"

const STORAGE_KEY = "petbound_favorites_v1"

interface FavoritesContextValue {
  favorites: Pet[]
  isReady: boolean
  isFavorited: (petId: number) => boolean
  toggleFavorite: (pet: Pet) => void
  removeFavorite: (petId: number) => void
  clearFavorites: () => void
}

const FavoritesContext = React.createContext<FavoritesContextValue | null>(null)

function readStorage(): Pet[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is Pet =>
        item && typeof item === "object" && typeof (item as Pet).id === "number",
    )
  } catch (err) {
    console.warn("[favorites] failed to read storage", err)
    return []
  }
}

function writeStorage(favorites: Pet[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  } catch (err) {
    console.warn("[favorites] failed to persist storage", err)
  }
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = React.useState<Pet[]>([])
  const [isReady, setIsReady] = React.useState(false)

  React.useEffect(() => {
    setFavorites(readStorage())
    setIsReady(true)
  }, [])

  React.useEffect(() => {
    if (!isReady) return
    writeStorage(favorites)
  }, [favorites, isReady])

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return
      setFavorites(readStorage())
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const isFavorited = React.useCallback(
    (petId: number) => favorites.some((p) => p.id === petId),
    [favorites],
  )

  const toggleFavorite = React.useCallback((pet: Pet) => {
    setFavorites((prev) => {
      const exists = prev.some((p) => p.id === pet.id)
      if (exists) {
        return prev.filter((p) => p.id !== pet.id)
      }
      return [pet, ...prev]
    })
  }, [])

  const removeFavorite = React.useCallback((petId: number) => {
    setFavorites((prev) => prev.filter((p) => p.id !== petId))
  }, [])

  const clearFavorites = React.useCallback(() => {
    setFavorites([])
  }, [])

  const value = React.useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      isReady,
      isFavorited,
      toggleFavorite,
      removeFavorite,
      clearFavorites,
    }),
    [favorites, isReady, isFavorited, toggleFavorite, removeFavorite, clearFavorites],
  )

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites(): FavoritesContextValue {
  const ctx = React.useContext(FavoritesContext)
  if (!ctx) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return ctx
}
