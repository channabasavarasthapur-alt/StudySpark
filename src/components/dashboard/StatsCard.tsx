import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendType?: 'positive' | 'neutral'
}

export function StatsCard({ label, value, icon: Icon, trend, trendType = 'positive' }: StatsCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-purple/30 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <h3 className="mt-2 text-3xl font-bold text-foreground">{value}</h3>
          {trend && (
            <p className={`mt-2 text-xs font-semibold ${
              trendType === 'positive' ? 'text-teal' : 'text-muted'
            }`}>
              {trend}
            </p>
          )}
        </div>
        <div className="rounded-xl bg-purple/10 p-3 text-purple">
          <Icon size={24} />
        </div>
      </div>
    </div>
  )
}
