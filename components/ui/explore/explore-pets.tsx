"use client"

import * as React from "react"
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { PetCard } from "@/components/ui/pet-card"
import { BreedFilter } from "./breed-filter"

import { fetchExplorePage } from "@/lib/server-actions"
import {
  DEFAULT_EXPLORE_FILTERS,
  type BreedOption,
  type ExploreFacets,
  type ExploreFilters,
} from "@/lib/explore-filters"
import type { Pet } from "@/lib/types/pet.interface"

type LocationStatus =
  | "idle"
  | "prompting"
  | "granted"
  | "denied"
  | "unsupported"

interface ExplorePetsProps {
  initialPets: Pet[]
  initialTotal: number
  initialTotalPages: number
  breedOptions: BreedOption[]
  facets: ExploreFacets
}

export function ExplorePets({
  initialPets,
  initialTotal,
  initialTotalPages,
  breedOptions,
  facets,
}: ExplorePetsProps) {
  const [pets, setPets] = React.useState<Pet[]>(initialPets)
  const [total, setTotal] = React.useState(initialTotal)
  const [totalPages, setTotalPages] = React.useState(initialTotalPages)
  const [page, setPage] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)
  const [filters, setFilters] = React.useState<ExploreFilters>(
    DEFAULT_EXPLORE_FILTERS,
  )
  const [locationStatus, setLocationStatus] =
    React.useState<LocationStatus>("idle")

  const load = React.useCallback(
    async (nextPage: number, nextFilters: ExploreFilters) => {
      setIsLoading(true)
      try {
        const res = await fetchExplorePage(nextPage, nextFilters)
        setPets(res.pets)
        setTotal(res.total)
        setTotalPages(res.totalPages)
        setPage(Math.min(nextPage, res.totalPages - 1))
        window.scrollTo({ top: 0, behavior: "smooth" })
      } catch (err) {
        console.error("Failed to fetch pets", err)
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  // Re-query from page 0 whenever the filters change (debounced). Skip the very
  // first render — the server already provided the unfiltered first page.
  const firstRun = React.useRef(true)
  React.useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    const t = window.setTimeout(() => void load(0, filters), 250)
    return () => window.clearTimeout(t)
  }, [filters, load])

  const toggle = (value: string, list: string[]) =>
    list.includes(value) ? list.filter((x) => x !== value) : [...list, value]

  const enableLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationStatus("unsupported")
      return
    }
    setLocationStatus("prompting")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationStatus("granted")
        setFilters((f) => ({
          ...f,
          coords: { lat: pos.coords.latitude, lon: pos.coords.longitude },
          radiusMiles: f.radiusMiles ?? 100,
        }))
      },
      () => setLocationStatus("denied"),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  }

  const disableLocation = () => {
    setLocationStatus("idle")
    setFilters((f) => ({ ...f, coords: null }))
  }

  const clearAll = () => {
    setLocationStatus("idle")
    setFilters(DEFAULT_EXPLORE_FILTERS)
  }

  const hasFacets =
    facets.ages.length > 0 ||
    facets.sizes.length > 0 ||
    facets.genders.length > 0

  const hasActiveFilters =
    filters.breeds.length > 0 ||
    filters.ages.length > 0 ||
    filters.sizes.length > 0 ||
    filters.genders.length > 0 ||
    filters.coords != null

  const canGoNext = page < totalPages - 1

  return (
    <section className="w-full bg-background px-4 py-10 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Find Your Life-Saving Match
          </h1>
          <p className="mt-3 text-muted-foreground">
            Filter by breed, traits, or location to find the right pet.
          </p>
        </div>

        {/* Filter panel */}
        <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <BreedFilter
              options={breedOptions}
              selected={filters.breeds}
              onChange={(breeds) => setFilters((f) => ({ ...f, breeds }))}
              className="flex-1"
            />
            <LocationControl
              status={locationStatus}
              active={filters.coords != null}
              radiusMiles={filters.radiusMiles}
              onEnable={enableLocation}
              onDisable={disableLocation}
              onRadius={(m) => setFilters((f) => ({ ...f, radiusMiles: m }))}
            />
          </div>

          {hasFacets && (
            <div className="mt-4 flex flex-col gap-4 border-t pt-4 sm:flex-row sm:flex-wrap sm:gap-x-10 sm:gap-y-4">
              {facets.ages.length > 0 && (
                <ChipGroup
                  label="Age"
                  options={facets.ages}
                  selected={filters.ages}
                  onToggle={(v) =>
                    setFilters((f) => ({ ...f, ages: toggle(v, f.ages) }))
                  }
                />
              )}
              {facets.sizes.length > 0 && (
                <ChipGroup
                  label="Size"
                  options={facets.sizes}
                  selected={filters.sizes}
                  onToggle={(v) =>
                    setFilters((f) => ({ ...f, sizes: toggle(v, f.sizes) }))
                  }
                />
              )}
              {facets.genders.length > 0 && (
                <ChipGroup
                  label="Gender"
                  options={facets.genders}
                  selected={filters.genders}
                  onToggle={(v) =>
                    setFilters((f) => ({
                      ...f,
                      genders: toggle(v, f.genders),
                    }))
                  }
                />
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {total.toLocaleString()} {total === 1 ? "pet" : "pets"}
            {hasActiveFilters ? " match your search" : " need a home"}
            {filters.coords ? " near you" : ""}.
          </p>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              <X className="mr-1 h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>

        <Separator />

        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Loading pets…
          </div>
        ) : pets.length === 0 ? (
          <div className="py-16 text-center">
            <AlertCircle className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No pets match this search. Try a different breed or widen your
              radius.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            disabled={page === 0 || isLoading}
            onClick={() => load(page - 1, filters)}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>

          <span className="text-sm tabular-nums text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>

          <Button
            variant="outline"
            disabled={!canGoNext || isLoading}
            onClick={() => load(page + 1, filters)}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}

function ChipGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      {options.map((option) => (
        <Button
          key={option}
          size="sm"
          variant={selected.includes(option) ? "default" : "secondary"}
          onClick={() => onToggle(option)}
        >
          {option}
        </Button>
      ))}
    </div>
  )
}

function LocationControl({
  status,
  active,
  radiusMiles,
  onEnable,
  onDisable,
  onRadius,
}: {
  status: LocationStatus
  active: boolean
  radiusMiles: number | null
  onEnable: () => void
  onDisable: () => void
  onRadius: (miles: number) => void
}) {
  if (active) {
    const miles = radiusMiles ?? 100
    return (
      <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-1.5">
        <MapPin className="h-4 w-4 shrink-0 text-primary" />
        <span className="text-sm font-medium whitespace-nowrap">Near you</span>
        <Slider
          value={[miles]}
          min={10}
          max={300}
          step={10}
          onValueChange={(v) => onRadius(v[0] ?? miles)}
          className="w-28"
          aria-label="Search radius in miles"
        />
        <span className="w-12 text-xs tabular-nums text-muted-foreground">
          {miles} mi
        </span>
        <button
          type="button"
          onClick={onDisable}
          aria-label="Turn off location search"
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onEnable}
      disabled={status === "prompting"}
    >
      <MapPin className="mr-2 h-4 w-4" />
      {status === "prompting"
        ? "Locating…"
        : status === "denied"
          ? "Location blocked — retry"
          : status === "unsupported"
            ? "Location unavailable"
            : "Use my location"}
    </Button>
  )
}
