import type { LucideIcon } from 'lucide-react'

interface SubjectCardProps {
  subject: string
  icon: LucideIcon
  lastStudied: string
  progress: number
  streak: number
  color: 'purple' | 'teal'
}

export function SubjectCard({
  subject,
  icon: Icon,
  lastStudied,
  progress,
  streak,
  color
}: SubjectCardProps) {
  const accentColor = color === 'purple' ? 'text-purple' : 'text-teal'
  const bgColor = color === 'purple' ? 'bg-purple/10' : 'bg-teal/10'
  const hoverBorder = color === 'purple' ? 'hover:border-purple/30' : 'hover:border-teal/30'

  return (
    <div className={`group relative rounded-2xl border border-border bg-card p-5 transition-all ${hoverBorder} hover:shadow-xl hover:shadow-slate-900/5`}>
      <div className="flex items-center justify-between">
        <div className={`grid size-12 place-items-center rounded-xl ${bgColor} ${accentColor}`}>
          <Icon size={24} />
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Streak</p>
          <p className={`text-lg font-black ${accentColor}`}>{streak} days</p>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-lg font-black text-foreground">{subject}</h4>
        <p className="text-sm text-muted">Last studied {lastStudied}</p>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-bold text-muted">Mastery</span>
          <span className="font-black text-foreground">{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/10">
          <div
            className={`h-full rounded-full transition-all duration-700 ${color === 'purple' ? 'bg-purple' : 'bg-teal'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
