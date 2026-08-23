import {
  dominantReason,
  earliestDeadline,
  formatDeadline,
} from "@/lib/seo/euthanasia"
import type { FaqItem } from "@/lib/seo/schema"
import type { Pet } from "@/lib/types/pet.interface"

/**
 * Copy for the shelter hub's "is this a kill shelter" section.
 *
 * Two rules govern everything here:
 *
 * 1. Only assert what the database holds. We store per-pet euthanasia dates and
 *    reasons; we do not store a shelter's admission policy or its save rate. So
 *    the answer describes scheduled euthanasia dates we are tracking, and never
 *    characterizes the shelter itself beyond that evidence. A shelter with no
 *    listed pets must not be described as one that kills.
 *
 * 2. The strings returned here are rendered verbatim on the page and reused in
 *    FAQPage JSON-LD. Google treats markup whose answers are not visible as
 *    spam, so both must come from these functions, never from parallel copy.
 */

export interface ShelterAnswerInput {
  /** Display name. Falls back to "Animal Shelter", matching animalShelterJsonLd. */
  shelterName: string
  cityName: string | null
  stateName: string | null
  /** Live pets at this shelter. Already filtered to upcoming deadlines. */
  pets: Array<Pick<Pet, "euthanasia_date" | "euthanasia_reason">>
}

/**
 * Direct answer block, 40 to 60 words. Search and AI systems extract the first
 * passage under a matching heading, so the verdict leads and the detail follows.
 */
export function shelterEuthanasiaAnswer(input: ShelterAnswerInput): string {
  const { shelterName, pets } = input
  const count = pets.length

  if (count === 0) {
    return `Not right now. Petbound is not tracking any pets at ${shelterName} with a scheduled euthanasia date. That can change within days, because shelters add animals to the list as space runs short. Pets listed at other shelters nearby still need homes today.`
  }

  const deadline = earliestDeadline(pets)
  const reason = dominantReason(pets)
  const sentences: string[] = []

  if (count === 1) {
    sentences.push(
      deadline
        ? `Yes. Petbound is tracking one pet at ${shelterName} with a scheduled euthanasia date, set for ${formatDeadline(deadline)}.`
        : `Yes. Petbound is tracking one pet at ${shelterName} that the shelter has scheduled for euthanasia.`,
    )
    if (reason) sentences.push(`${reason} is the reason listed.`)
    sentences.push(
      `That pet can still be adopted, fostered, or pulled by a rescue, and doing that before the date is what takes it off the list.`,
    )
  } else {
    sentences.push(
      deadline
        ? `Yes. Petbound is tracking ${count} pets at ${shelterName} with scheduled euthanasia dates, the earliest on ${formatDeadline(deadline)}.`
        : `Yes. Petbound is tracking ${count} pets at ${shelterName} that the shelter has scheduled for euthanasia.`,
    )
    if (reason) sentences.push(`${reason} is the most common reason listed.`)
    sentences.push(
      `Each of them can still be adopted, fostered, or pulled by a rescue, and doing that before the date is what takes a pet off the list.`,
    )
  }

  return sentences.join(" ")
}

/** Heading for the answer section. Phrased to match how the query is typed. */
function shelterAnswerHeading(shelterName: string): string {
  return `Is ${shelterName} a kill shelter?`
}

/**
 * Meta description built from the answer, clipped to whole sentences. Slicing
 * at a raw character count leaves snippets ending mid-clause ("Behavior is "),
 * which reads as broken in a search result.
 */
export function shelterMetaDescription(input: ShelterAnswerInput): string {
  const text = shelterEuthanasiaAnswer(input)
  const max = 160
  if (text.length <= max) return text

  const sentences = text.match(/[^.]+\./g) ?? []
  let out = ""
  for (const sentence of sentences) {
    if ((out + sentence).length > max) break
    out += sentence
  }
  out = out.trim()
  if (out) return out

  // One sentence already over the limit: fall back to a word boundary.
  const cut = text.slice(0, max)
  const lastSpace = cut.lastIndexOf(" ")
  return `${lastSpace > 0 ? cut.slice(0, lastSpace) : cut}...`
}

/**
 * FAQ pairs rendered on the page and mirrored into FAQPage markup. Answers stay
 * grounded in what we actually publish: holding periods vary by state law and
 * shelter policy, which we do not store, so that question is answered by
 * pointing at the per-pet dates we do have.
 */
export function shelterFaqItems(input: ShelterAnswerInput): FaqItem[] {
  const { shelterName, cityName, stateName, pets } = input
  const place = [cityName, stateName].filter(Boolean).join(", ")
  const deadline = earliestDeadline(pets)

  const items: FaqItem[] = [
    {
      question: shelterAnswerHeading(shelterName),
      answer: shelterEuthanasiaAnswer(input),
    },
    {
      question: `How long does ${shelterName} hold a pet before euthanizing it?`,
      answer: `Holding periods are set by state law and by each shelter's own policy, and they vary widely. Petbound does not estimate them. What we publish is the specific date the shelter has scheduled for each pet, taken from its listing, so you can see exactly how much time an individual animal has left.`,
    },
    {
      question: "What does the date on a listing mean?",
      answer: `It is the date the shelter has scheduled that pet to be euthanized if nobody adopts, fosters, or rescues it first. Dates can move earlier when a shelter runs out of space, so treat a listed date as the latest safe moment rather than a guarantee.`,
    },
    {
      question: `How do I adopt a pet from ${shelterName} before its deadline?`,
      answer: `Contact ${shelterName} directly by phone or email using the details on this page, and name the specific pet and its shelter ID. Ask about visiting hours, adoption requirements, and whether fostering or a rescue transfer is possible if you cannot adopt outright.`,
    },
  ]

  if (pets.length > 0 && deadline) {
    items.push({
      question: `Which pet at ${shelterName} is running out of time first?`,
      answer: `The soonest deadline currently listed${place ? ` at this ${place} shelter` : ""} is ${formatDeadline(deadline)}. Listings on this page are ordered by how much time each pet has left, so the animals at the top are the ones closest to their date.`,
    })
  }

  return items
}
