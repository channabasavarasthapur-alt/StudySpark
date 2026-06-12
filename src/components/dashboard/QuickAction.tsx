import type { LucideIcon } from 'lucide-react'

interface QuickActionProps {
  label: string
  icon: LucideIcon
  color: 'purple' | 'teal'
  onClick?: () => void
}

export function QuickAction({ label, icon: Icon, color, onClick }: QuickActionProps) {
  const colorClasses = {
    purple: 'bg-purple text-purple-foreground shadow-purple/20 hover:brightness-110',
    teal: 'bg-teal text-teal-foreground shadow-teal/20 hover:brightness-110',
  }

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold shadow-lg transition-all active:scale-[0.98] ${colorClasses[color]}`}
    >
      <Icon size={18} />
      {label}
    </button>
  )
}
