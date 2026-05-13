"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { PetCard } from "@/components/ui/pet-card"
import { AlertCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

import { FilterSidebar, type PetFilters } from "./filter-sidebar"
import {
  fetchPetsPage,
  resolveFilteredPetsTotalPages,
} from "@/lib/server-actions"
import type { Pet } from "@/lib/types/pet.interface"
import { PETS_PER_PAGE } from "@/lib/pets-pagination"

const DEFAULT_FILTERS: PetFilters = {
  radiusMiles: 50,
  ages: [],
  sizes: [],
}

function initialTotalPagesHint(pets: Pet[]): number | null {
  if (pets.length === 0) return 1
  if (pets.length < PETS_PER_PAGE) return 1
  return null
}

interface ExplorePetsProps {
  initialPets: Pet[]
}

export function ExplorePets({ initialPets }: ExplorePetsProps) {
  const [pets, setPets] = React.useState<Pet[]>(initialPets)
  const [pageNumber, setPageNumber] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)
  const [filters, setFilters] = React.useState<PetFilters>(DEFAULT_FILTERS)
  const [totalPages, setTotalPages] = React.useState<number | null>(() =>
    initialTotalPagesHint(initialPets),
  )

  React.useEffect(() => {
    if (initialPets.length < PETS_PER_PAGE) return

    let cancelled = false
    void resolveFilteredPetsTotalPages(DEFAULT_FILTERS).then((t) => {
      if (!cancelled) setTotalPages(t)
    })
    return () => {
      cancelled = true
    }
  }, [initialPets.length])

  const fetchPage = React.useCallback(
    async (page: number, nextFilters: PetFilters) => {
      setIsLoading(true)
      try {
        const fetched = await fetchPetsPage(page, nextFilters)
        setPets(fetched)
        setPageNumber(page)
        if (fetched.length < PETS_PER_PAGE) {
          setTotalPages(page + 1)
        }
        window.scrollTo({ top: 0, behavior: "smooth" })
      } catch (err) {
        console.error("Failed to fetch pets", err)
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const applyingRef = React.useRef(false)

  const applyFilters = React.useCallback(async () => {
    if (applyingRef.current) return
    applyingRef.current = true
    setIsLoading(true)
    try {
      const [fetched, total] = await Promise.all([
        fetchPetsPage(0, filters),
        resolveFilteredPetsTotalPages(filters),
      ])
      setPets(fetched)
      setPageNumber(0)
      setTotalPages(total)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err) {
      console.error("Failed to fetch pets", err)
    } finally {
      setIsLoading(false)
      applyingRef.current = false
    }
  }, [filters])

  const pageLabel =
    totalPages === null ? (
      <span className="text-sm text-muted-foreground tabular-nums">
        Page {pageNumber + 1}
        <span className="ml-1 opacity-70">/ …</span>
      </span>
    ) : (
      <span className="text-sm text-muted-foreground tabular-nums">
        Page {pageNumber + 1} of {totalPages}
      </span>
    )

  const canGoNext =
    totalPages === null
      ? pets.length === PETS_PER_PAGE
      : pageNumber < totalPages - 1

  return (
    <section className="w-full bg-background py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Find Your Life-Saving Match</h1>
          <p className="mt-3 text-muted-foreground">
            Filter by distance and criteria to discover the right pet.
          </p>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 hidden md:block border-r pr-6">
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              onApply={applyFilters}
              disabled={isLoading}
            />
          </div>

          <div className="md:col-span-3 space-y-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-24 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Loading pets…
              </div>
            ) : pets.length === 0 ? (
              <div className="text-center py-16">
                <AlertCircle className="mx-auto mb-4" />
                <p>No pets found. Try adjusting filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pets.map((pet) => (
                  <PetCard key={pet.id} pet={pet} />
                ))}
              </div>
            )}

            <div className="flex justify-between items-center pt-8">
              <Button
                variant="outline"
                disabled={pageNumber === 0 || isLoading}
                onClick={() => fetchPage(pageNumber - 1, filters)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              {pageLabel}

              <Button
                variant="outline"
                disabled={!canGoNext || isLoading}
                onClick={() => fetchPage(pageNumber + 1, filters)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
