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
    purple: 'text-purple bg-purple/10 border-purple/20 shadow-purple/5',
    teal: 'text-teal bg-teal/10 border-teal/20 shadow-teal/5'
  }

  return (
    <div className="flex flex-col rounded-2xl border border-border/40 bg-muted/5 p-6 transition-all">
      <div className="flex items-center gap-4">
        <div className={`grid size-12 place-items-center rounded-xl border ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm font-bold text-muted uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-black text-foreground">{value}</p>
        </div>
      </div>
      {progress !== undefined && (
        <div className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/10">
            <div
              className={`h-full transition-all duration-1000 ${color === 'purple' ? 'bg-purple' : 'bg-teal'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      <p className="mt-4 text-sm text-muted leading-relaxed font-medium">
        {description}
      </p>
    </div>
  )
}
