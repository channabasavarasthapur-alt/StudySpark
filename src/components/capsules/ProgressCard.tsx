interface ProgressCardProps {
  label: string
  percentage: number
  status: string
  color: 'purple' | 'teal'
}

export function ProgressCard({ label, percentage, status, color }: ProgressCardProps) {
  const barColors = {
    purple: 'bg-purple',
    teal: 'bg-teal'
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-bold text-foreground">{label}</span>
        <span className={`text-sm font-black ${color === 'purple' ? 'text-purple' : 'text-teal'}`}>
          {percentage}%
        </span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/10">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ${barColors[color]}`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
        </div>
      </div>
      <p className="mt-3 text-xs font-medium text-muted">{status}</p>
    </div>
  )
}
