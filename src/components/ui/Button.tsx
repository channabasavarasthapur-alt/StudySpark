import type { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export function Button({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
}: ButtonProps) {
  const baseStyles = 'relative inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-purple/40 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed overflow-hidden group'

  const variants = {
    primary: 'bg-foreground text-background hover:opacity-90',
    secondary: 'bg-purple text-purple-foreground hover:brightness-110 shadow-lg shadow-purple/20',
    outline: 'border border-border bg-transparent text-foreground hover:bg-foreground/5',
    ghost: 'text-muted hover:text-foreground hover:bg-foreground/5',
    glass: 'glass text-foreground hover:bg-white/10 dark:hover:bg-white/5',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      <span className="relative z-10">{children}</span>
      {(variant === 'primary' || variant === 'secondary') && (
        <div className="absolute inset-0 z-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </button>
  )
}
