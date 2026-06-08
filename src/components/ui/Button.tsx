import type { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
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
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-bold transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-purple/50 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-purple text-purple-foreground shadow-[0_16px_40px_color-mix(in_srgb,var(--purple)_28%,transparent)] hover:brightness-110',
    secondary: 'bg-teal text-teal-foreground shadow-[0_16px_40px_color-mix(in_srgb,var(--teal)_28%,transparent)] hover:brightness-110',
    outline: 'border border-border bg-card text-foreground hover:border-teal hover:text-teal',
    ghost: 'text-muted hover:bg-muted/10 hover:text-foreground',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3.5 text-base',
    lg: 'px-10 py-4 text-lg',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}
