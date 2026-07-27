import Link from "next/link"

/**
 * Pill-style row of related hub links ("Other states", "Other breeds", …).
 * Reads as a quiet footer while keeping the internal-linking dense for SEO.
 */
export function HubRelatedLinks({
  heading,
  links,
}: {
  heading: string
  links: Array<{ href: string; label: string }>
}) {
  if (links.length === 0) return null
  return (
    <section className="space-y-4 border-t pt-8">
      <h2 className="text-lg font-semibold">{heading}</h2>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border bg-card px-3.5 py-1.5 text-sm text-muted-foreground shadow-sm transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  )
}
