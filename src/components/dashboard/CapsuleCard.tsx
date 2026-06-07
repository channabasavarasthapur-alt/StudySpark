import { Clock } from 'lucide-react'

interface CapsuleCardProps {
  title: string
  subject: string
  progress: number
  lastActive: string
}

export function CapsuleCard({ title, subject, progress, lastActive }: CapsuleCardProps) {
  return (
    <div className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-teal/50 hover:shadow-lg hover:shadow-teal/5">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal">{subject}</span>
          <h4 className="mt-1 font-bold text-foreground">{title}</h4>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Clock size={14} />
          {lastActive}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-medium text-muted">Progress</span>
          <span className="font-bold text-foreground">{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted/20">
          <div
            className="h-full rounded-full bg-teal transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
