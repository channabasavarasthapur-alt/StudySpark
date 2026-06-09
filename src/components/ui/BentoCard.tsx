import type { ReactNode } from 'react'

interface BentoCardProps {
  children: ReactNode
  className?: string
  title?: string
  description?: string
  icon?: ReactNode
  badge?: string
}

export function BentoCard({
  children,
  className = '',
  title,
  description,
  icon,
  badge,
}: BentoCardProps) {
  return (
    <div className={`group relative overflow-hidden rounded-3xl border border-border bg-card p-6 bento-shadow transition-all duration-500 hover:border-purple/30 hover:shadow-2xl hover:shadow-purple/5 hover:-translate-y-1 ${className}`}>
      {/* Background Decor */}
      <div className="absolute -right-10 -top-10 size-40 rounded-full bg-purple/5 blur-3xl transition-all group-hover:bg-purple/10" />

      <div className="relative z-10 flex h-full flex-col">
        {(icon || badge || title) && (
          <div className="mb-4">
            <div className="flex items-center justify-between gap-4">
              {icon && (
                <div className="flex size-10 items-center justify-center rounded-xl bg-foreground/5 text-foreground transition-colors group-hover:bg-purple group-hover:text-purple-foreground">
                  {icon}
                </div>
              )}
              {badge && (
                <span className="rounded-full bg-purple/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple">
                  {badge}
                </span>
              )}
            </div>
            {title && <h3 className="mt-4 text-lg font-bold text-foreground">{title}</h3>}
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
        )}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}
