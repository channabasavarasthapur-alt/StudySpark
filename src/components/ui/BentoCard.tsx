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
    <div className={`group relative overflow-hidden rounded-xl border border-border bg-card p-5 bento-shadow transition-colors duration-200 hover:border-purple/20 sm:p-6 ${className}`}>
      <div className="relative flex h-full flex-col">
        {(icon || badge || title) && (
          <div className="mb-4">
            <div className="flex items-center justify-between gap-4">
              {icon && (
                <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-background text-purple">
                  {icon}
                </div>
              )}
              {badge && (
                <span className="rounded-full border border-purple/15 bg-purple/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple">
                  {badge}
                </span>
              )}
            </div>
            {title && <h3 className="mt-4 text-lg font-extrabold tracking-tight text-foreground">{title}</h3>}
            {description && <p className="mt-1 text-sm leading-6 text-muted">{description}</p>}
          </div>
        )}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}
