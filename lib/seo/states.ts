/** US state code → full name, for hub URLs, titles, and breadcrumbs. */
export const STATE_NAMES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
}

const NAME_TO_CODE: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_NAMES).map(([code, name]) => [name.toLowerCase(), code]),
)

/**
 * Resolves a shelter's `state` value to a 2-letter code. Accepts codes in any
 * case ("ca") and full names ("California") to guard against data drift.
 */
export function stateCodeFrom(value: string | null): string | null {
  if (!value) return null
  const trimmed = value.trim()
  const upper = trimmed.toUpperCase()
  if (upper in STATE_NAMES) return upper
  return NAME_TO_CODE[trimmed.toLowerCase()] ?? null
}

export function stateNameFromCode(code: string): string | null {
  return STATE_NAMES[code.toUpperCase()] ?? null
}

export function isKnownStateCode(code: string): boolean {
  return code.toUpperCase() in STATE_NAMES
}
