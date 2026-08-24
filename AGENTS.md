# AGENTS.md: petbound-web

Context for agents working in this repo. Read before changing pet pages, metadata,
or anything under `lib/seo/`.

## What this is

Petbound is an adoption site listing shelter animals that have a scheduled
euthanasia date. Next.js (App Router) + TypeScript on Vercel, Supabase (Postgres)
for data, populated by a separate Python scraper (see "Sibling repo").

**Effectively all traffic is organic search.** There is no ad spend and no
significant referral traffic, so SEO decisions are product decisions here.

## Sibling repo

`../scraper` (github.com/Petbound-org/petbound-scraper) writes the `pets` and
`shelters` tables this app reads. It runs daily via GitHub Actions from `main`.
When fields look empty site-wide, suspect the scraper before the app. That repo
has its own AGENTS.md.

## Data realities that constrain the product

These are properties of the database, not opinions. Check them before writing
copy or building features that assume otherwise.

- **No outcome tracking.** There is no `status` or outcome column, and the scraper
  never deletes. A pet disappearing from the source is indistinguishable from one
  that was euthanized. **Never write copy claiming a pet was saved, adopted, or
  killed.** Save-rate statistics are impossible; volume statistics are fine.
- **The `pets` table is append-only.** ~16.5k rows, of which only ~875 are live on
  a given day. The rest are past-deadline history that is still served.
- **`updated_at` is dead weight.** It is byte-identical to `created_at` on every
  row: the scraper never writes it and there is no trigger. Do not use it as a
  "last seen" signal.
- **Scraped fields are blank strings, not null.** Guard with
  `value?.trim() || fallback`. Using `??` alone lets `""` through, which is what
  produced empty `<title>` tags on hundreds of pages.
- **Euthanasia dates are soft.** Roughly 28% of live pets carry a date more than
  14 days after they were first seen (longest observed: 185 days), because the
  scraper upserts in place and shelters push dates back. A passed date does not
  mean the animal died.

## Pet listing lifecycle

`lib/pet-status.ts` is the single source of truth. Three states:

| State | When | Behaviour |
|---|---|---|
| `live` | deadline today or later | Countdown, shelter contact, in hub counts |
| `unconfirmed` | within `GRACE_PERIOD_DAYS` (7) after | No countdown, outcome stated as unknown, contact still prominent |
| `expired` | beyond the grace window | Page still served, points at pets that still have time |

**Expired pages are deliberately not 404'd and not noindexed.** They are ~91% of
indexed pet pages and carry most of the site's search traffic. They leave the
sitemap after the grace window but keep serving. This is intentional; do not
"clean it up".

## Dates and timezones

`euthanasia_date` is a date-only column. Comparing it against wall-clock
`Date.now()` reads a day early through every Pacific evening. This bug has
appeared twice (pet countdown, and hub "urgent" counts).

- Day arithmetic: `daysUntilDeadline` / `daysPastDeadline` (`lib/pet-status.ts`)
- Display: `formatDeadline` (`lib/seo/euthanasia.ts`), renders in UTC
- "Still at risk" cutoff: `todayLocalISO()` (`lib/today.ts`)

Do not reintroduce ad-hoc `new Date(x).getTime() - Date.now()` arithmetic.

## SEO conventions

- **One canonical host: `www.petbound.org`.** All absolute URLs come from
  `BASE_URL` (`lib/seo/constants.ts`). `next.config.ts` permanently redirects the
  `.vercel.app` alias and the apex.
- **Titles** use `%s | Petbound` from the root layout, so page titles stay bare.
- **No em dashes in user-facing copy.** They read as machine-written. Use commas,
  colons, or parentheses. Code comments are exempt. See
  `.agents/skills/seo-audit/references/ai-writing-detection.md` for the wider list.
- **FAQ markup must match the page.** Google treats `FAQPage` JSON-LD whose
  answers are not visible as spam, so both come from the same functions in
  `lib/seo/shelter-summary.ts`. Never write separate copy for crawlers.
- **Hub pages follow one pattern**: `export const revalidate = 1800`,
  `generateMetadata` with a canonical, `notFound()` on null data, composed from
  `components/seo/*`. Copy an existing hub rather than inventing a new shape.
- **New static routes must be added to `app/sitemap.ts`** (`STATIC_PATHS`), they
  are not discovered automatically.

## Performance note

`getLivePets()` (`lib/api/hubs.ts`) loads every live pet with its joined shelter
into memory on a 30-minute cache. Explore, all four hub types, similar-pets and
the sitemap all slice that one array. **New aggregate pages over live pets need
zero new database queries.** Follow `getIndexableBreeds` as the model.

The one exception is `lib/api/research.ts`, which powers
`/research/shelter-euthanasia-data`. `getLivePets()` filters to
`euthanasia_date >= today` and so sees ~6% of the table; the report exists to
describe the other 94%, which no other code path reads. It pages the whole table
once a day and caches the **computed aggregates** rather than the rows, because
`unstable_cache` caps an entry near 2MB and ~17k rows would strain it. Do not
copy that shape for anything that could be built from `getLivePets()`.

## Strategy: what these pages are for

The site targets the intersection of euthanasia intent and adoption intent, which
is close to uncontested, rather than broad head terms like "kill shelter" that are
held by ASPCA / Best Friends / Humane Society.

Evidence behind that choice, from Search Console:

- Shelter pages once targeted shelter *names*, which is navigational intent the
  site cannot win: 1,660 impressions produced 3 clicks (0.2% CTR). They now target
  "is [shelter] a kill shelter" and "[shelter] euthanasia list", where per-pet
  deadline data is the only source that answers.
- Pet detail pages are the engine: ~91% of all clicks, ~10% CTR.
- The searched vocabulary is "at-risk", "urgent", "priority", "rescue needed",
  "emergency placement". Individual shelters rank for these. Only DogsInDanger.com
  aggregates nationally, and it is also the scraper's source.

## Known open items

- **The apex redirect is still a 307 (temporary).** It is configured at the Vercel
  domain level and fires at the edge before Next runs, so `next.config.ts` cannot
  override it. Fix in the Vercel dashboard: Project Settings, Domains,
  `petbound.org`, permanent redirect. The CLI has no command for the status code.
- Pet descriptions are stored verbatim from DogsInDanger.com, which is duplicate
  content on the highest-performing page type. Unresolved.
- The 607,000 euthanasia figure on `about-us` carries no source link. It needs
  one (Shelter Animals Count publishes the national numbers) or it is the
  weakest claim on the page an AI reads to decide what Petbound is.
- State-level pages ("kill shelters in [state]") were planned but not built.

## Working with Vercel

CLI is linked to `pebound/petbound-web`, but it **defaults to the wrong scope**.
Every command needs `--scope pebound` or it fails with "no project found".
Local builds need Supabase credentials: `vercel env pull .env.local --scope pebound`.
