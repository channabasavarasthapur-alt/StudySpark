import { ThemeToggle } from '../ThemeToggle'
import type { View } from '../../types/navigation'

export function Navbar({ onNavigate }: { onNavigate: (view: View) => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <a href="#top" className="flex min-w-0 items-center gap-3" aria-label="StudySpark home">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-purple text-lg font-black text-purple-foreground shadow-[0_0_32px_color-mix(in_srgb,var(--purple)_45%,transparent)]">
            S
          </span>
          <span className="truncate text-lg font-semibold text-foreground">StudySpark</span>
        </a>

        <div className="hidden items-center gap-8 text-sm font-medium text-muted md:flex">
          <a className="transition hover:text-foreground" href="#features">
            Features
          </a>
          <a className="transition hover:text-foreground" href="#about">
            About
          </a>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => onNavigate('dashboard')}
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-teal hover:text-teal"
          >
            Login
          </button>
        </div>
      </nav>
    </header>
  )
}
