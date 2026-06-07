interface ProgressCardProps {
  label: string
  current: number
  total: number
  color: 'purple' | 'teal'
}

export function ProgressCard({ label, current, total, color }: ProgressCardProps) {
  const percentage = Math.round((current / total) * 100) || 0
  const accentColor = color === 'purple' ? 'text-purple' : 'text-teal'
  const barColor = color === 'purple' ? 'bg-purple' : 'bg-teal'

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted">{label}</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground">{current}</span>
            <span className="text-sm font-bold text-muted">/ {total}</span>
          </div>
        </div>
        <div className={`text-2xl font-black ${accentColor}`}>
          {percentage}%
        </div>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-muted/10">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
          style={{ width: `${percentage}%` }}
        >
          <div className="h-full w-full bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
        </div>
      </div>
    </div>
  )
}
