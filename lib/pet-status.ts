import { todayLocalISO } from "@/lib/today"

/**
 * Lifecycle of a listing after its euthanasia date passes.
 *
 * A passed date does not mean the animal died. The scraper upserts on
 * (shelter_given_id, shelter_id), so a row's euthanasia_date holds the most
 * recent date the source published while created_at holds when we first saw it.
 * Measured against live listings, 28% currently carry a date more than 14 days
 * after first sight (longest: 185 days), which means shelters routinely push
 * these dates back. A listing that goes quiet is far more often extended,
 * adopted, or pulled by a rescue than carried out on schedule.
 *
 * We also cannot tell the difference. There is no outcome column, and a pet
 * disappearing from the source is indistinguishable from one euthanized. So the
 * only honest thing to say once a date passes is that we do not know.
 *
 * Hence three states rather than a live/dead flip:
 *
 *   live         deadline is today or later. Show the countdown.
 *   unconfirmed  within GRACE_PERIOD_DAYS after. Outcome unknown, and the date
 *                may simply have moved, so keep the shelter contact prominent.
 *   expired      beyond that. Still served (these pages carry most of the
 *                site's search traffic) but no longer presented as actionable.
 */

export const GRACE_PERIOD_DAYS = 7

export type PetStatus = "live" | "unconfirmed" | "expired"

/** Whole days from the deadline to today. Negative while still upcoming. */
export function daysPastDeadline(
  euthanasiaDate: string | null,
  today: string = todayLocalISO(),
): number | null {
  if (!euthanasiaDate) return null
  const deadline = Date.parse(`${euthanasiaDate}T00:00:00Z`)
  const now = Date.parse(`${today}T00:00:00Z`)
  if (Number.isNaN(deadline) || Number.isNaN(now)) return null
  return Math.round((now - deadline) / 86_400_000)
}

/**
 * Whole days until the deadline. Negative once the date has passed.
 *
 * Prefer this over ad-hoc `new Date(x) - Date.now()` arithmetic: that compares a
 * UTC-parsed midnight against wall-clock now, which reads a day early through
 * every Pacific evening. Countdowns and urgent counts must agree.
 */
export function daysUntilDeadline(
  euthanasiaDate: string | null,
  today: string = todayLocalISO(),
): number | null {
  const past = daysPastDeadline(euthanasiaDate, today)
  return past === null ? null : -past
}

export function petStatus(
  euthanasiaDate: string | null,
  today: string = todayLocalISO(),
): PetStatus {
  const past = daysPastDeadline(euthanasiaDate, today)
  // No date recorded: nothing to have expired, so treat it as a live listing.
  if (past === null) return "live"
  if (past <= 0) return "live"
  return past <= GRACE_PERIOD_DAYS ? "unconfirmed" : "expired"
}

/**
 * Cutoff for queries that should include grace-period listings.
 * Returns YYYY-MM-DD, GRACE_PERIOD_DAYS before `today`.
 */
export function graceCutoffISO(today: string = todayLocalISO()): string {
  const ms = Date.parse(`${today}T00:00:00Z`) - GRACE_PERIOD_DAYS * 86_400_000
  return new Date(ms).toISOString().slice(0, 10)
}
