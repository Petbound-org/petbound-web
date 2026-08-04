"use client"

import * as React from "react"
import { ChevronDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import type { BreedOption } from "@/lib/explore-filters"

/**
 * Typeable, multi-select breed filter. Type to narrow the list, click to add;
 * selected breeds show as removable chips. Built from primitives — no combobox
 * dependency.
 */
export function BreedFilter({
  options,
  selected,
  onChange,
  className,
}: {
  options: BreedOption[]
  selected: string[]
  onChange: (breeds: string[]) => void
  className?: string
}) {
  const [query, setQuery] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const selectedSet = React.useMemo(() => new Set(selected), [selected])

  const selectedOptions = options.filter((o) => selectedSet.has(o.slug))
  const matches = options
    .filter(
      (o) =>
        !selectedSet.has(o.slug) &&
        o.name.toLowerCase().includes(query.trim().toLowerCase()),
    )
    .slice(0, 8)

  const add = (slug: string) => {
    onChange([...selected, slug])
    setQuery("")
  }
  const remove = (slug: string) =>
    onChange(selected.filter((s) => s !== slug))

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent p-1.5 shadow-xs transition-[color,box-shadow]",
          "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        )}
      >
        {selectedOptions.map((o) => (
          <span
            key={o.slug}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground"
          >
            {o.name}
            <button
              type="button"
              onClick={() => remove(o.slug)}
              aria-label={`Remove ${o.name}`}
              className="rounded-full hover:opacity-80"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          placeholder={selectedOptions.length ? "" : "Filter by breed…"}
          className="min-w-24 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
        />
        <ChevronDown className="mr-1 h-4 w-4 shrink-0 text-muted-foreground" />
      </div>

      {open && matches.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-popover py-1 text-popover-foreground shadow-md">
          {matches.map((o) => (
            <li key={o.slug}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  add(o.slug)
                }}
                className="flex w-full items-center justify-between px-3 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
              >
                <span>{o.name}</span>
                <span className="text-xs text-muted-foreground">{o.count}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
