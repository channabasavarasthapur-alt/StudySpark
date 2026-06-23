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
  const baseStyles = 'relative inline-flex items-center justify-center rounded-xl font-semibold tracking-tight transition-[background-color,border-color,color,box-shadow,transform] duration-200 will-change-transform active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-purple/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed overflow-hidden group'

  const variants = {
    primary: 'bg-foreground text-background shadow-sm hover:bg-foreground/90',
    secondary: 'bg-purple text-purple-foreground shadow-sm shadow-purple/15 hover:bg-purple/90',
    outline: 'border border-border bg-card text-foreground shadow-sm hover:border-purple/30 hover:bg-purple/5',
    ghost: 'text-muted hover:text-foreground hover:bg-foreground/5',
    glass: 'border border-border bg-card text-foreground shadow-sm hover:bg-background',
  }

  const sizes = {
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      <span className="relative z-10 inline-flex min-w-0 items-center justify-center gap-2">{children}</span>
    </button>
  )
}
