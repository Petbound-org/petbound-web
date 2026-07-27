import type { Pet } from "@/lib/types/pet.interface"

/**
 * Generates a unique, data-driven summary paragraph for a pet from its own
 * fields. Every pet detail page otherwise shares the same layout and boilerplate
 * ("No description available.", the identical How-to-Adopt steps), which Google
 * clusters as "Duplicate without user-selected canonical". A few sentences of
 * text that varies by name/breed/gender/age/size/location/urgency gives each
 * page enough unique content to be indexed on its own.
 */

export interface PetSummaryContext {
  /** Display city, e.g. "Bakersfield". */
  cityName?: string | null
  /** Full state name, e.g. "California". */
  stateName?: string | null
  /** Shelter display name. */
  shelterName?: string | null
  /** Whole days until the euthanasia date (negative if passed). */
  daysLeft?: number | null
  /** Cleaned euthanasia reason, e.g. "Lack of Space". */
  reason?: string | null
  /** Normalized breed, e.g. "Labrador Retriever". */
  breedName?: string | null
}

// Pets carry a recorded sex; use it for natural pronouns and fall back to the
// neutral they/them when it's absent or unrecognized.
function pronouns(gender: string | null | undefined): {
  subject: string
  possessive: string
  verb: string
} {
  const g = gender?.trim().toLowerCase()
  if (g === "male") return { subject: "he", possessive: "his", verb: "is" }
  if (g === "female") return { subject: "she", possessive: "her", verb: "is" }
  return { subject: "they", possessive: "their", verb: "are" }
}

function capitalize(input: string): string {
  return input.charAt(0).toUpperCase() + input.slice(1)
}

function agePhrase(age: string | null): string | null {
  if (!age) return null
  const a = age.trim().toLowerCase()
  if (a.includes("under")) return "still very young"
  if (a === "young adult") return "a young adult"
  if (a === "adult") return "fully grown"
  return a
}

export function petSummary(pet: Pet, ctx: PetSummaryContext = {}): string {
  const name = pet.name?.trim() || "This pet"
  const p = pronouns(pet.gender)
  const breed = ctx.breedName ?? pet.breed ?? null
  const place = [ctx.cityName, ctx.stateName].filter(Boolean).join(", ")
  const sentences: string[] = []

  // 1. Identity + location.
  const descriptor =
    [pet.gender?.trim().toLowerCase(), breed].filter(Boolean).join(" ") || "pet"
  let identity = `${name} is an adoptable ${descriptor} looking for a home`
  if (ctx.shelterName) identity += ` at ${ctx.shelterName}`
  if (place) identity += ` in ${place}`
  sentences.push(`${identity}.`)

  // 2. Traits (age + size).
  const traits: string[] = []
  const age = agePhrase(pet.age)
  if (age) traits.push(age)
  if (pet.size) traits.push(`${pet.size.trim().toLowerCase()} in size`)
  if (traits.length) {
    sentences.push(`${capitalize(p.subject)} ${p.verb} ${traits.join(" and ")}.`)
  }

  // 3. Urgency.
  if (ctx.daysLeft != null || pet.euthanasia_date) {
    let urgency = `${capitalize(p.subject)} ${p.verb} currently on the shelter's euthanasia list`
    if (ctx.daysLeft != null) {
      const d = ctx.daysLeft
      urgency +=
        d <= 0
          ? " and time has already run out"
          : d === 1
            ? " with just one day left"
            : ` with only ${d} days left`
    }
    if (ctx.reason) urgency += `, listed due to ${ctx.reason.trim().toLowerCase()}`
    sentences.push(`${urgency}.`)
  }

  // 4. Call to action.
  sentences.push(
    `Adopting ${name} — or simply sharing ${p.possessive} story — could save a life before it's too late.`,
  )

  return sentences.join(" ")
}
