/**
 * Today's date as YYYY-MM-DD in US Pacific time.
 *
 * Used as the "still at risk" cutoff for pets (euthanasia_date >= today). Using
 * `new Date().toISOString()` would give the UTC date, which rolls over to
 * tomorrow during evening Pacific hours — dropping every pet whose deadline is
 * *today* (the most urgent "last day" listings) from Explore, the hubs, and the
 * sitemap. Anchoring to a single US timezone keeps that boundary stable
 * regardless of where the server runs (Vercel runs in UTC).
 */
export function todayLocalISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
  }).format(new Date())
}
