import type { LucideIcon } from 'lucide-react'

interface StudyStatsCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color: 'purple' | 'teal'
  trend?: string
}

export function StudyStatsCard({ label, value, icon: Icon, color, trend }: StudyStatsCardProps) {
  const accentColor = color === 'purple' ? 'text-purple' : 'text-teal'
  const bgColor = color === 'purple' ? 'bg-purple/10' : 'bg-teal/10'

  return (
    <div className="flex items-center gap-5 rounded-2xl border border-border bg-card p-6 transition-all hover:border-border/80">
      <div className={`grid size-14 shrink-0 place-items-center rounded-2xl ${bgColor} ${accentColor}`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted">{label}</p>
        <div className="mt-1 flex items-center gap-3">
          <span className="text-2xl font-black text-foreground">{value}</span>
          {trend && (
            <span className={`text-xs font-bold ${accentColor} rounded-full ${bgColor} px-2 py-0.5`}>
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
