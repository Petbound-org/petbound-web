"use client";

import * as React from "react";
import { Slider } from "@/components/ui/slider";

/**
 * LocationSlider
 * ----------------
 * Small, reusable UI component for selecting a distance radius (in miles).
 *
 * Responsibilities:
 * - Display a slider
 * - Display the selected radius value
 *
 * It does NOT:
 * - Know anything about pets
 * - Fetch data
 * - Manage global state
 */
interface LocationSliderProps {
  radiusMiles: number;
  onChange: (miles: number) => void;
  maxMiles?: number;
  step?: number;
}

export function LocationSlider({
  radiusMiles,
  onChange,
  maxMiles = 200,
  step = 10,
}: LocationSliderProps) {
  const handleValueChange = (value: number[]) => {
    onChange(value[0] ?? radiusMiles);
  };

  return (
    <div className="space-y-2">
      <Slider
        value={[radiusMiles]}
        max={maxMiles}
        step={step}
        onValueChange={handleValueChange}
      />
      <p className="text-sm font-semibold text-primary">
        {radiusMiles} miles radius
      </p>
    </div>
  );
}
