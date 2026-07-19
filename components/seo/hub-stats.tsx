import { AlertCircle } from "lucide-react"

/**
 * Urgency stat band shown near the top of hub pages.
 */
export function HubStats({
  stats,
  urgentCount,
}: {
  stats: Array<{ value: number; label: string }>
  urgentCount?: number
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-xl border bg-muted/40 px-6 py-4">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{stat.value}</span>
          <span className="text-sm text-muted-foreground">{stat.label}</span>
        </div>
      ))}
      {urgentCount != null && urgentCount > 0 && (
        <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-semibold">
            {urgentCount} within 3 days of euthanasia
          </span>
        </div>
      )}
    </div>
  )
}
