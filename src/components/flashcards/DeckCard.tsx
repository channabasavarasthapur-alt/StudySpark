import type { LucideIcon } from 'lucide-react'

interface DeckCardProps {
  subject: string
  icon: LucideIcon
  cardsCount: number
  progress: number
  lastStudied: string
  color: 'purple' | 'teal'
}

export function DeckCard({
  subject,
  icon: Icon,
  cardsCount,
  progress,
  lastStudied,
  color
}: DeckCardProps) {
  const accentColor = color === 'purple' ? 'text-purple' : 'text-teal'
  const bgColor = color === 'purple' ? 'bg-purple/10' : 'bg-teal/10'
  const borderColor = color === 'purple' ? 'border-purple/20' : 'border-teal/20'

  return (
    <div className={`group relative flex flex-col rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-border/80 hover:shadow-xl`}>
      <div className="flex items-center justify-between gap-4">
        <div className={`grid size-14 place-items-center rounded-2xl border ${borderColor} ${bgColor} ${accentColor}`}>
          <Icon size={28} />
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Progress</p>
          <p className={`text-xl font-black ${accentColor}`}>{progress}%</p>
        </div>
      </div>

      <div className="mt-8">
        <h4 className="text-xl font-black text-foreground">{subject}</h4>
        <div className="mt-2 flex items-center gap-3 text-sm font-medium text-muted">
          <span>{cardsCount} Cards</span>
          <span className="size-1 rounded-full bg-border" />
          <span>{lastStudied}</span>
        </div>
      </div>

      <div className="mt-8">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted/10">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${color === 'purple' ? 'bg-purple' : 'bg-teal'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <button className="mt-6 w-full rounded-xl border border-border bg-background py-3 text-sm font-bold text-foreground transition-all group-hover:border-purple/30 group-hover:text-purple">
        Open Deck
      </button>
    </div>
  )
}
