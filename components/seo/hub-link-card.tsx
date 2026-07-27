import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import type { ReactNode } from "react"

/**
 * Compact link card for hub directories (states, cities, breeds, shelters).
 * Matches the PetCard aesthetic — rounded-xl, hairline border, soft shadow that
 * lifts on hover — with an icon chip and a nudging arrow.
 */
export function HubLinkCard({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string
  icon?: ReactNode
  title: string
  subtitle?: string
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
    >
      {icon && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground [&>svg]:h-5 [&>svg]:w-5">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{title}</span>
        {subtitle && (
          <span className="block truncate text-sm text-muted-foreground">
            {subtitle}
          </span>
        )}
      </span>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  )
}
