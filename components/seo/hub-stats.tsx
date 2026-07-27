import { AlertCircle } from "lucide-react"

/**
 * Urgency stat band for hub pages: neutral stat cards with large numbers plus
 * a red "within 3 days" callout that echoes the pet detail page's danger band.
 */
export function HubStats({
  stats,
  urgentCount,
}: {
  stats: Array<{ value: number; label: string }>
  urgentCount?: number
}) {
  return (
    <div className="flex flex-wrap items-stretch gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border bg-card px-5 py-3 shadow-sm"
        >
          <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </div>
      ))}
      {urgentCount != null && urgentCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border-2 border-red-200 bg-red-50 px-5 py-3 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
          <AlertCircle className="h-6 w-6 shrink-0 text-red-600 dark:text-red-500" />
          <div>
            <div className="text-2xl font-bold leading-none">{urgentCount}</div>
            <div className="mt-0.5 text-xs font-medium">within 3 days</div>
          </div>
        </div>
      )}
    </div>
  )
}
