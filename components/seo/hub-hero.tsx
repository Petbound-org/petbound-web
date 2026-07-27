import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"

/**
 * Shared hero band for the SEO hub pages (state / city / breed / shelter).
 * Mirrors the site's marketing feel: a subtle top band, large tracking-tight
 * title, muted subtitle, and an optional urgency eyebrow. Stats / actions are
 * passed as children so each page can slot in its own <HubStats>.
 */
export function HubHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
}: {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  breadcrumbs?: ReactNode
  children?: ReactNode
}) {
  return (
    <section className="border-b bg-gradient-to-b from-muted/50 to-background">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {breadcrumbs}
        <div className="max-w-3xl space-y-4">
          {eyebrow && (
            <Badge
              variant="secondary"
              className="gap-1.5 px-3 py-1 text-sm font-medium"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              {eyebrow}
            </Badge>
          )}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="text-lg text-muted-foreground sm:text-xl">
              {description}
            </p>
          )}
        </div>
        {children}
      </div>
    </section>
  )
}
