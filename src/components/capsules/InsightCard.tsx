import type { LucideIcon } from 'lucide-react'

interface InsightCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  description: string
  color: 'purple' | 'teal'
  progress?: number
}

export function InsightCard({ label, value, icon: Icon, description, color, progress }: InsightCardProps) {
  const colorClasses = {
    purple: 'text-purple bg-purple/5 border-purple/15',
    teal: 'text-teal bg-teal/5 border-teal/15'
  }

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`grid size-12 place-items-center rounded-lg border ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-extrabold text-foreground">{value}</p>
        </div>
      </div>
      {progress !== undefined && (
        <div className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/10">
            <div
              className={`h-full progress-transition ${color === 'purple' ? 'bg-purple' : 'bg-teal'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      <p className="mt-4 text-sm leading-6 text-muted">
        {description}
      </p>
    </div>
  )
}
