import type { Pet } from "@/lib/types/pet.interface"

/**
 * Shared helpers for presenting euthanasia data. Both the pet detail page and
 * the shelter hub describe the same underlying fields, so the normalization and
 * date formatting live here rather than being reimplemented per page.
 */

/**
 * Scraped reasons are terse. Expand the ones that read as fragments so they fit
 * mid-sentence; pass everything else through untouched.
 */
export function normalizeEuthanasiaReason(input: string | null): string | null {
  if (!input) return null
  const trimmed = input.trim()
  if (!trimmed) return null
  if (trimmed.toLowerCase() === "space") return "Lack of Space"
  return trimmed
}

/**
 * Format a date-only column for display. `euthanasia_date` has no time or zone,
 * so it is rendered in UTC: parsing "2026-03-14" yields UTC midnight, which any
 * timezone west of Greenwich would otherwise render as the 13th.
 */
export function formatDeadline(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}

type DatedPet = Pick<Pet, "euthanasia_date" | "euthanasia_reason">

/** Earliest upcoming deadline in the set, or null when none carry a date. */
export function earliestDeadline(pets: DatedPet[]): string | null {
  let earliest: string | null = null
  for (const pet of pets) {
    const date = pet.euthanasia_date
    if (!date) continue
    if (earliest === null || date < earliest) earliest = date
  }
  return earliest
}

/**
 * Most frequently listed reason across the set, normalized. Ties resolve to
 * whichever reason was counted first, which is stable because the caller's pet
 * order is itself stable (sorted by euthanasia_date, then id).
 */
export function dominantReason(pets: DatedPet[]): string | null {
  const counts = new Map<string, number>()
  for (const pet of pets) {
    const reason = normalizeEuthanasiaReason(pet.euthanasia_reason)
    if (!reason) continue
    counts.set(reason, (counts.get(reason) ?? 0) + 1)
  }

  let best: string | null = null
  let bestCount = 0
  for (const [reason, count] of counts) {
    if (count > bestCount) {
      best = reason
      bestCount = count
    }
  }
  return best
}
