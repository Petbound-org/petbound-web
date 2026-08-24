import Link from "next/link"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"

import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { HubHero } from "@/components/seo/hub-hero"
import { HubStats } from "@/components/seo/hub-stats"
import { JsonLd } from "@/components/seo/json-ld"

import { getResearchStats, type ResearchStats } from "@/lib/api/research"
import { formatDeadline } from "@/lib/seo/euthanasia"
import {
  LEAD_QUESTION,
  monthLabel,
  researchFaqItems,
  researchLimitations,
  researchMetaDescription,
  researchTitle,
  type ResearchFaqId,
} from "@/lib/seo/research-summary"
import {
  articleJsonLd,
  datasetJsonLd,
  faqPageJsonLd,
} from "@/lib/seo/schema"

// The underlying scrape runs once a day, so anything shorter regenerates this
// page for data that cannot have changed.
export const revalidate = 86400

const PATH = "/research/shelter-euthanasia-data"

/** First publication. Fixed, unlike dateModified, which tracks the data. */
const DATE_PUBLISHED = "2026-08-23"

export async function generateMetadata() {
  const stats = await getResearchStats()
  if (stats.coverage.totalListings === 0) {
    return { title: "Not Found", robots: { index: false } }
  }
  return {
    title: researchTitle(stats),
    description: researchMetaDescription(stats),
    alternates: { canonical: PATH },
  }
}

export default async function ResearchPage() {
  const stats = await getResearchStats()
  if (stats.coverage.totalListings === 0) {
    notFound()
  }

  // The tables below take the whole stats object, so only the values used
  // directly in this scope are pulled out here.
  const { coverage, leadTime } = stats
  const faqs = researchFaqItems(stats)
  // faqs[0] is the lead answer, rendered on its own above the rest. The JSON-LD
  // still carries every pair and every answer stays visible exactly once.
  const [leadFaq, ...supportingFaqs] = faqs
  const limitations = researchLimitations(stats)

  const temporalCoverage =
    coverage.firstSeen && coverage.lastSeen
      ? `${coverage.firstSeen}/${coverage.lastSeen}`
      : undefined

  return (
    <div className="min-h-screen">
      <JsonLd
        data={datasetJsonLd({
          name: "Petbound shelter euthanasia listing data",
          description: researchMetaDescription(stats),
          url: PATH,
          temporalCoverage,
          variableMeasured: [
            "Scheduled euthanasia date",
            "Shelter-stated reason",
            "Breed",
            "Shelter location",
            "Date the listing was first recorded",
          ],
          isBasedOn: "https://www.dogsindanger.com/",
          dateModified: coverage.lastSeen ?? stats.generatedAt,
          keywords: [
            "animal shelter",
            "euthanasia list",
            "dog adoption",
            "at-risk animals",
            "shelter capacity",
          ],
        })}
      />
      <JsonLd
        data={articleJsonLd({
          headline: researchTitle(stats),
          description: researchMetaDescription(stats),
          url: PATH,
          datePublished: DATE_PUBLISHED,
          dateModified: stats.generatedAt,
        })}
      />
      {/* Answers below are rendered on the page, which Google requires. */}
      <JsonLd data={faqPageJsonLd(faqs)} />

      {/* No eyebrow: HubHero renders it with a pulsing red urgency dot, which
          is right for a listings hub and wrong for a methodology page. The
          breadcrumb already identifies this as research. */}
      <HubHero
        title="How much time shelter dogs on euthanasia lists actually get"
        description={`Findings from every at-risk listing Petbound has recorded since ${
          coverage.firstSeen ? formatDeadline(coverage.firstSeen) : "late 2025"
        }. Updated daily.`}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Research" },
            ]}
          />
        }
      >
        <HubStats
          stats={[
            {
              value: coverage.totalListings.toLocaleString("en-US"),
              label: "listings recorded",
            },
            { value: `${leadTime.median} days`, label: "median notice" },
            {
              value: coverage.liveListings.toLocaleString("en-US"),
              label: "listed right now",
            },
            { value: coverage.shelterCount, label: "shelters tracked" },
          ]}
        />
      </HubHero>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Lead with the answer. Extraction takes the first passage under a
            matching heading, so nothing may sit between the two. */}
        <section className="mb-14 max-w-3xl space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">{LEAD_QUESTION}</h2>
          <p className="text-lg leading-relaxed text-foreground/90">
            {leadFaq.answer}
          </p>
        </section>

        <div className="space-y-14">
          {supportingFaqs.map((faq) => (
            <section key={faq.id} className="space-y-4">
              <h2 className="max-w-3xl text-2xl font-bold tracking-tight">
                {faq.question}
              </h2>
              <p className="max-w-3xl leading-relaxed text-foreground/90">
                {faq.answer}
              </p>
              {supporting(faq.id, stats)}
            </section>
          ))}
        </div>

        <section className="mt-16 max-w-3xl space-y-6 border-t pt-10">
          <h2 className="text-2xl font-bold tracking-tight">
            Methodology and limitations
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            Petbound collects at-risk listings once a day from dogsindanger.com
            and stores one row per pet per shelter, updating that row in place
            when the source changes. The figures on this page are counts over
            those rows. What follows are the limits of what they can support.
          </p>
          <ul className="space-y-4">
            {limitations.map((note) => (
              <li
                key={note.slice(0, 40)}
                className="border-l-2 border-border pl-4 leading-relaxed text-muted-foreground"
              >
                {note}
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            Data last refreshed {formatDeadline(stats.generatedAt)}. Questions or
            corrections: <a className="underline" href="mailto:petboundorg@gmail.com">petboundorg@gmail.com</a>.
          </p>
        </section>

        <section className="mt-16 max-w-3xl space-y-4 border-t pt-10">
          <h2 className="text-2xl font-bold tracking-tight">
            See who is listed right now
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            Every figure above comes from listings that are still open to
            adoption, fostering, or rescue transfer.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              className="rounded-full border px-4 py-2 text-sm hover:border-primary/40"
              href="/explore"
            >
              Browse every current listing
            </Link>
            <Link
              className="rounded-full border px-4 py-2 text-sm hover:border-primary/40"
              href="/adopt"
            >
              Browse by state
            </Link>
            <Link
              className="rounded-full border px-4 py-2 text-sm hover:border-primary/40"
              href="/shelters"
            >
              Browse by shelter
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

/** The table or chart that belongs under each answer, if any. */
function supporting(id: ResearchFaqId, stats: ResearchStats): ReactNode {
  switch (id) {
    case "reasons":
      return <ReasonTable stats={stats} />
    case "states":
      return <StateTable stats={stats} />
    case "breeds":
      return <BreedTable stats={stats} />
    case "volume":
      return <MonthTable stats={stats} />
    default:
      return null
  }
}

function TableShell({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-3xl overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-sm">{children}</table>
    </div>
  )
}

const TH = "px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
const TD = "border-t px-4 py-2.5"
const TD_NUM = `${TD} text-right tabular-nums`

function ReasonTable({ stats }: { stats: ResearchStats }) {
  return (
    <TableShell>
      <thead>
        <tr>
          <th className={TH}>Reason the shelter listed</th>
          <th className={`${TH} text-right`}>Listings</th>
          <th className={`${TH} text-right`}>Share</th>
        </tr>
      </thead>
      <tbody>
        {stats.reasons.map((reason) => (
          <tr key={reason.label}>
            <td className={TD}>{reason.label}</td>
            <td className={TD_NUM}>{reason.count.toLocaleString("en-US")}</td>
            <td className={TD_NUM}>{reason.pct}%</td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  )
}

function StateTable({ stats }: { stats: ResearchStats }) {
  return (
    <TableShell>
      <thead>
        <tr>
          <th className={TH}>State</th>
          <th className={`${TH} text-right`}>All listings</th>
          <th className={`${TH} text-right`}>Share</th>
          <th className={`${TH} text-right`}>Listed now</th>
          <th className={`${TH} text-right`}>Shelters</th>
        </tr>
      </thead>
      <tbody>
        {stats.states.map((state) => (
          <tr key={state.code}>
            <td className={TD}>
              <Link
                className="underline hover:text-primary"
                href={`/adopt/${state.code.toLowerCase()}`}
              >
                {state.name}
              </Link>
            </td>
            <td className={TD_NUM}>{state.listings.toLocaleString("en-US")}</td>
            <td className={TD_NUM}>{state.pct}%</td>
            <td className={TD_NUM}>{state.live.toLocaleString("en-US")}</td>
            <td className={TD_NUM}>{state.shelters}</td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  )
}

function BreedTable({ stats }: { stats: ResearchStats }) {
  return (
    <TableShell>
      <thead>
        <tr>
          <th className={TH}>Breed</th>
          <th className={`${TH} text-right`}>Listed right now</th>
        </tr>
      </thead>
      <tbody>
        {stats.breeds.map((breed) => (
          <tr key={breed.name}>
            <td className={TD}>{breed.name}</td>
            <td className={TD_NUM}>{breed.live.toLocaleString("en-US")}</td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  )
}

function MonthTable({ stats }: { stats: ResearchStats }) {
  return (
    <TableShell>
      <thead>
        <tr>
          <th className={TH}>Month</th>
          <th className={`${TH} text-right`}>New listings recorded</th>
        </tr>
      </thead>
      <tbody>
        {stats.months.map((month) => (
          <tr key={month.month}>
            <td className={TD}>{monthLabel(month.month)}</td>
            <td className={TD_NUM}>
              {month.listings === 0 ? (
                <span className="text-muted-foreground">no collection</span>
              ) : (
                month.listings.toLocaleString("en-US")
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  )
}
