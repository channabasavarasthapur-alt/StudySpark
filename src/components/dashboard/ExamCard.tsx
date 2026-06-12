import { Calendar } from 'lucide-react'

interface ExamCardProps {
  title: string
  date: string
  daysLeft: number
  difficulty: 'High' | 'Medium' | 'Low'
}

export function ExamCard({ title, date, daysLeft, difficulty }: ExamCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-purple/30">
      <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-purple/10 text-purple">
        <Calendar size={24} />
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="truncate font-bold text-foreground">{title}</h4>
        <p className="mt-0.5 text-xs text-muted">{date}</p>
      </div>

      <div className="text-right">
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
          difficulty === 'High' ? 'bg-red-500/10 text-red-500' :
          difficulty === 'Medium' ? 'bg-orange-500/10 text-orange-500' :
          'bg-teal/10 text-teal'
        }`}>
          {difficulty}
        </span>
        <p className="mt-1 text-xs font-bold text-foreground">{daysLeft} days left</p>
      </div>
    </div>
  )
}
