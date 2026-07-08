import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../theme/themeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-card text-muted shadow-sm transition hover:border-purple/30 hover:bg-purple/5 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-purple/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      type="button"
      onClick={toggleTheme}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
