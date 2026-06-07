import type { LucideIcon } from 'lucide-react'

interface InsightCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  description: string
  color: 'purple' | 'teal'
}

export function InsightCard({ label, value, icon: Icon, description, color }: InsightCardProps) {
  const colorClasses = {
    purple: 'text-purple bg-purple/10 border-purple/20 shadow-purple/5',
    teal: 'text-teal bg-teal/10 border-teal/20 shadow-teal/5'
  }

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-border/80">
      <div className="flex items-center gap-4">
        <div className={`grid size-12 place-items-center rounded-xl border ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm font-bold text-muted uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-black text-foreground">{value}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted leading-relaxed">
        {description}
      </p>
    </div>
  )
}
