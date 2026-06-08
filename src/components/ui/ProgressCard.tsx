interface ProgressCardProps {
  label: string
  current?: number
  total?: number
  percentage?: number
  status?: string
  color?: 'purple' | 'teal'
}

export function ProgressCard({
  label,
  current,
  total,
  percentage: manualPercentage,
  status,
  color = 'purple'
}: ProgressCardProps) {
  const percentage = manualPercentage ?? (current !== undefined && total !== undefined ? Math.round((current / total) * 100) : 0)

  const accentColor = color === 'purple' ? 'text-purple' : 'text-teal'
  const barColor = color === 'purple' ? 'bg-purple' : 'bg-teal'

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-muted">{label}</span>
          {current !== undefined && total !== undefined && (
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">{current}</span>
              <span className="text-xs font-bold text-muted">/ {total}</span>
            </div>
          )}
        </div>
        <div className={`text-xl font-black ${accentColor}`}>
          {percentage}%
        </div>
      </div>

      <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/10">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ${barColor}`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
        </div>
      </div>

      {status && (
        <p className="mt-3 text-xs font-medium text-muted">{status}</p>
      )}
    </div>
  )
}
