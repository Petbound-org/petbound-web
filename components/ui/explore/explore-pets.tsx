"use client";

import * as React from "react";
import { PetCard } from "@/components/ui/pet-card";
import { Pet } from "@/lib/types/pet.interface";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

import { FilterSidebar, PetFilters } from "./filter-sidebar";
import { getPets } from "@/lib/server-actions";

/**
 * Pagination configuration.
 * Replace TOTAL_PETS_ESTIMATE with a real count from your DB later.
 */
const PETS_PER_PAGE = 30;
const TOTAL_PETS_ESTIMATE = 120;
const TOTAL_PAGES = Math.ceil(TOTAL_PETS_ESTIMATE / PETS_PER_PAGE);

/**
 * ExplorePets
 * ------------
 * The "smart" component for the Explore page.
 *
 * Owns:
 * - filter state
 * - pagination state
 * - fetching pets
 *
 * Delegates:
 * - UI controls → FilterSidebar
 * - individual pet rendering → PetCard
 */
interface ExplorePetsProps {
  initialPets: Pet[];
}

export function ExplorePets({ initialPets }: ExplorePetsProps) {
  const [pets, setPets] = React.useState<Pet[]>(initialPets);
  const [pageNumber, setPageNumber] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

  const [filters, setFilters] = React.useState<PetFilters>({
    radiusMiles: 50,
    ages: [],
    sizes: [],
  });

  const fetchPage = async (page: number, nextFilters = filters) => {
    setIsLoading(true);
    try {
      const fetchedPets = await getPets(
        PETS_PER_PAGE,
        page,
        nextFilters
      );
      setPets(fetchedPets);
      setPageNumber(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Failed to fetch pets", err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    if (!isLoading) fetchPage(0, filters);
  };

  return (
    <section className="w-full bg-background py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold">
            Find Your Life-Saving Match
          </h1>
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
            {pets.length === 0 && !isLoading ? (
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

            {/* Pagination */}
            <div className="flex justify-between items-center pt-8">
              <Button
                variant="outline"
                disabled={pageNumber === 0 || isLoading}
                onClick={() => fetchPage(pageNumber - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <Button
                variant="outline"
                disabled={pageNumber >= TOTAL_PAGES - 1 || isLoading}
                onClick={() => fetchPage(pageNumber + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
