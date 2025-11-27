// src/components/ExplorePets.tsx

"use client"

import * as React from "react"
import { PetCard } from "@/components/ui/pet-card"
import { Pet } from "@/lib/types/pet.interface"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider" 
import { Button } from "@/components/ui/button"
import { Search, Filter, Compass, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Import the Server Action for fetching data (You must define this in src/lib/server-actions.ts)
import { getPets } from "@/lib/server-actions" 

interface ExplorePetsProps {
  initialPets: Pet[]
  initialCount: number
}

// --- CONSTANTS ---
const PETS_PER_PAGE = 30; 
// Placeholder estimate for total count. Should be fetched from DB in a real app.
const TOTAL_PETS_ESTIMATE = 120; 
const AGE_OPTIONS = ["Under 6 months", "Young adult", "Adult"]
const SIZE_OPTIONS = ["Small", "Medium", "Large", "X-Large"]
const TOTAL_PAGES = Math.ceil(TOTAL_PETS_ESTIMATE / PETS_PER_PAGE);


// --- LocationSliderWithLabel Component ---
const LocationSliderWithLabel = () => {
    const [miles, setMiles] = React.useState(50);
    const handleValueChange = (value: number[]) => { setMiles(value[0]); };
    return (
        <div className="space-y-2">
            <Slider 
                defaultValue={[miles]} 
                max={200} 
                step={10} 
                onValueChange={handleValueChange}
            />
            <p className="text-sm font-semibold text-primary">
                {miles} miles radius
            </p>
        </div>
    );
};


// --- FilterSidebar Component (Placeholder for filter UI) ---
const FilterSidebar = () => {
    const [selectedAges, setSelectedAges] = React.useState<string[]>([])
    const [selectedSizes, setSelectedSizes] = React.useState<string[]>([])

    const handleToggle = (item: string, state: string[], setState: React.Dispatch<React.SetStateAction<string[]>>) => {
        if (state.includes(item)) { setState(state.filter(i => i !== item)) } 
        else { setState([...state, item]) }
    }
    const handleApplyFilters = () => { console.log("Applying Filters:", { ages: selectedAges, sizes: selectedSizes }); }

    return (
        <div className="p-4 space-y-6 sticky top-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
                <Filter className="w-5 h-5 mr-2 text-primary" />
                Refine Search
            </h3>
            
            <Separator />

            {/* 1. Location Filter */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground flex items-center mb-4">
                    <Compass className="w-4 h-4 mr-2" />
                    Location Radius
                </label>
                <LocationSliderWithLabel />
            </div>
            
            <Separator />

            {/* 2. Age Filter */}
            <div className="space-y-4">
                <label className="text-sm font-medium text-muted-foreground">
                    Age Category
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                    {AGE_OPTIONS.map(age => {
                        const isSelected = selectedAges.includes(age)
                        return (
                            <Button 
                                className="
                                    transition-all 
                                    duration-200 
                                    ease-in-out 
                                    hover:shadow-lg 
                                    hover:-translate-y-px
                                    border border-transparent
                                    hover:border-gray-400
                                "
                                key={age} 
                                variant={isSelected ? "default" : "secondary"} 
                                size="sm"
                                onClick={() => handleToggle(age, selectedAges, setSelectedAges)}
                            >
                                {age}
                            </Button>
                        )
                    })}
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                    Selected: {selectedAges.join(', ') || 'None'}
                </p>
            </div>

            <Separator />

            {/* 3. Size Filter */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">
                    Pet Size
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                    {SIZE_OPTIONS.map(size => {
                        const isSelected = selectedSizes.includes(size)
                        return (
                            <Button 
                                className="
                                    transition-all 
                                    duration-200 
                                    ease-in-out 
                                    hover:shadow-lg 
                                    hover:-translate-y-px
                                    border border-transparent
                                    hover:border-gray-400
                                "
                                key={size} 
                                variant={isSelected ? "default" : "secondary"}
                                size="sm"
                                onClick={() => handleToggle(size, selectedSizes, setSelectedSizes)}
                            >
                                {size}
                            </Button>
                        )
                    })}
                </div>
                <blockquote className="text-xs text-muted-foreground border-l-2 pl-2 mt-2">
                    Note: Size is determined by recorded label or inferred from weight.
                </blockquote>
            </div>

            {/* Temporary Alert Saying Feature Doesn't Work */}
            <AlertDialog>
            <AlertDialogTrigger asChild>

                {/* This button is important tho */}
                <Button 
                    className="w-full mt-6 flex items-center"
                    onClick={handleApplyFilters} 
                >
                    <Search className="w-4 h-4 mr-2" />
                    Apply Filters
                </Button>


            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Feature Temporarily Unavailable</AlertDialogTitle>
                <AlertDialogDescription>
                    Sorry for the inconvenience! The filtering functionality is currently under maintenance and will be back soon.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogAction>Return</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}


// --- ExplorePets Main Component ---

export function ExplorePets({ initialPets, initialCount }: ExplorePetsProps) {
    const [pets, setPets] = React.useState<Pet[]>(initialPets)
    // Page state is 0-indexed (0 = page 1, 1 = page 2) to match the desired offset calculation
    const [pageNumber, setPageNumber] = React.useState(0) 
    const [isLoading, setIsLoading] = React.useState(false)

    // Define the Ref for scrolling to the grid
    const petGridRef = React.useRef<HTMLDivElement>(null); 

    // Centralized function to fetch data for a specific page offset
    const fetchPage = React.useCallback(async (page: number) => {
        setIsLoading(true);
        // The offset logic is now contained within the Server Action, 
        // but we pass the 0-indexed page number as the offset argument.
        // We still send PETS_PER_PAGE as the count parameter.
        const count = PETS_PER_PAGE; 
        const offset = page; // page=0 for first 30, page=1 for next 30, etc.

        try {
            const fetchedPets = await getPets(count, offset);
            setPets(fetchedPets);
            setPageNumber(page);
            
            // Scroll user to the Ref's position for smooth UX
            if (petGridRef.current) {
                // Scroll to the very top of the page for smooth UX
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            
        } catch (error) {
            console.error("Failed to fetch page:", error);
        } finally {
            setIsLoading(false);
        }
    }, [])

    const handlePreviousPage = () => {
        // Check if pageNumber (offset index) is greater than 0
        if (pageNumber > 0 && !isLoading) {
            fetchPage(pageNumber - 1);
        }
    };

    const handleNextPage = () => {
        // Check if pageNumber (offset index) is less than the last page index (TOTAL_PAGES - 1)
        if (pageNumber < TOTAL_PAGES - 1 && !isLoading) {
            fetchPage(pageNumber + 1);
        }
    };

    return (
        <section className="w-full bg-background py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto space-y-10">
                
                {/* Title Section */}
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                        Find Your Life-Saving Match
                    </h1>
                    <p className="mt-3 text-lg text-muted-foreground">
                        Filter by distance and criteria to discover the urgent pet that's right for you.
                    </p>
                </div>

                <Separator />

                {/* Main Layout: Filters and Pet Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    
                    {/* Column 1: Filters */}
                    <div className="md:col-span-1 border-r pr-6 hidden md:block">
                        <FilterSidebar />
                    </div>

                    {/* Column 2-4: Pet Grid and Pagination */}
                    <div className="md:col-span-3 space-y-8">
                        
                        {/* Container for Pet Grid (Scroll Target) */}
                        <div ref={petGridRef} className="space-y-8"> 
                            
                            {/* Pet Grid Display */}
                            {pets.length === 0 && !isLoading ? (
                                <div className="text-center py-16">
                                    <AlertCircle className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-lg text-muted-foreground">
                                        No urgent pets found matching your criteria. Try adjusting your filters!
                                    </p>
                                </div>
                            ) : (
                                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                    {pets.map((pet) => (
                                        <PetCard key={pet.id} pet={pet} />
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* PAGINATION CONTROLS (Stable Layout) */}
                        <div className="flex justify-between items-center pt-8">
                            
                            {/* Previous button wrapper (always occupies space: w-1/3) */}
                            <div className="w-1/3 flex justify-start">
                                <Button
                                    variant="outline"
                                    onClick={handlePreviousPage}
                                    disabled={isLoading || pageNumber === 0} // Disabled if 0-indexed page is 0
                                    className="flex items-center gap-2"
                                    // Hide but maintain layout space
                                    style={{ visibility: pageNumber === 0 ? 'hidden' : 'visible' }}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous Page
                                </Button>
                            </div>

                            {/* Page Number (centered: w-1/3) */}
                            <div className="w-1/3 flex justify-center">
                                <span className="text-sm text-muted-foreground">
                                    {/* Convert 0-indexed state back to 1-indexed for display */}
                                    Page {pageNumber + 1}
                                </span>
                            </div>

                            {/* Next button wrapper (always occupies space: w-1/3) */}
                            <div className="w-1/3 flex justify-end">
                                <Button
                                    variant="outline"
                                    onClick={handleNextPage}
                                    disabled={isLoading || pageNumber >= TOTAL_PAGES - 1} // Disabled if 0-indexed page is the last index
                                    className="flex items-center gap-2"
                                    // Hide but maintain layout space
                                    style={{ visibility: pageNumber >= TOTAL_PAGES - 1 ? 'hidden' : 'visible' }}
                                >
                                    Next Page
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}