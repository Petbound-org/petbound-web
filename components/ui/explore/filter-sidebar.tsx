"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Search, Filter, Compass } from "lucide-react";
import { LocationSlider } from "./location-slider";

/**
 * Canonical filter option definitions.
 * Keeping these centralized prevents UI / server mismatches.
 */
export const AGE_OPTIONS = ["Under 6 months", "Young adult", "Adult"] as const;
export const SIZE_OPTIONS = ["Small", "Medium", "Large", "X-Large"] as const;

export type AgeOption = (typeof AGE_OPTIONS)[number];
export type SizeOption = (typeof SIZE_OPTIONS)[number];

/**
 * Filter state shape used by ExplorePets and server actions.
 */
export interface PetFilters {
  radiusMiles: number;
  ages: AgeOption[];
  sizes: SizeOption[];
}

/**
 * Props for FilterSidebar.
 *
 * NOTE:
 * This component is UI-only.
 * It never fetches data directly.
 */
interface FilterSidebarProps {
  filters: PetFilters;
  onChange: (next: PetFilters) => void;
  onApply: () => void;
  disabled?: boolean;
}

export function FilterSidebar({
  filters,
  onChange,
  onApply,
  disabled,
}: FilterSidebarProps) {
  const toggleItem = <T,>(item: T, list: T[]) =>
    list.includes(item)
      ? list.filter((x) => x !== item)
      : [...list, item];

  return (
    <div className="p-4 space-y-6 sticky top-4">
      <h3 className="text-xl font-semibold text-foreground flex items-center">
        <Filter className="w-5 h-5 mr-2 text-primary" />
        Refine Search
      </h3>

      <Separator />

      {/* Location */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground flex items-center">
          <Compass className="w-4 h-4 mr-2" />
          Location Radius
        </label>

        <LocationSlider
          radiusMiles={filters.radiusMiles}
          onChange={(miles) =>
            onChange({ ...filters, radiusMiles: miles })
          }
        />
      </div>

      <Separator />

      {/* Age */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground">
          Age Category
        </label>

        <div className="flex flex-wrap gap-2">
          {AGE_OPTIONS.map((age) => (
            <Button
              key={age}
              size="sm"
              variant={filters.ages.includes(age) ? "default" : "secondary"}
              disabled={disabled}
              onClick={() =>
                onChange({
                  ...filters,
                  ages: toggleItem(age, filters.ages),
                })
              }
            >
              {age}
            </Button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Selected: {filters.ages.join(", ") || "None"}
        </p>
      </div>

      <Separator />

      {/* Size */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground">
          Pet Size
        </label>

        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map((size) => (
            <Button
              key={size}
              size="sm"
              variant={filters.sizes.includes(size) ? "default" : "secondary"}
              disabled={disabled}
              onClick={() =>
                onChange({
                  ...filters,
                  sizes: toggleItem(size, filters.sizes),
                })
              }
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      {/* Apply */}
      <Button
        className="w-full mt-6 flex items-center"
        onClick={onApply}
        disabled={disabled}
      >
        <Search className="w-4 h-4 mr-2" />
        Apply Filters
      </Button>
    </div>
  );
}
