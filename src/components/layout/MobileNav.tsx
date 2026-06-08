import { useState, useEffect } from 'react'
import { Menu, X, LogOut } from 'lucide-react'
import { ThemeToggle } from '../ThemeToggle'
import type { View } from '../../types/navigation'
import { NAV_ITEMS } from '../../constants/navigation'

interface MobileNavProps {
  onNavigate: (view: View) => void
  onBack: () => void
  activeItem: string
  navItems: typeof NAV_ITEMS
}

export function MobileNav({ onNavigate, onBack, activeItem, navItems }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <div className="lg:hidden">
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-lg bg-purple text-base font-black text-purple-foreground shadow-lg shadow-purple/20">
            S
          </span>
          <span className="text-lg font-bold text-foreground">StudySpark</span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-foreground hover:bg-muted/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple/50"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-30 bg-background/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <aside className={`fixed top-0 right-0 z-50 h-full w-72 border-l border-border bg-card shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-6 border-b border-border">
          <span className="text-lg font-bold text-foreground">Navigation</span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-muted/10 rounded-lg"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                onNavigate(item.view)
                setIsOpen(false)
              }}
              className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-base font-semibold transition-all ${
                activeItem === item.label
                  ? 'bg-purple/10 text-purple'
                  : 'text-muted hover:bg-muted/10 hover:text-foreground'
              }`}
            >
              <item.icon size={22} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-6 bg-card">
          <button
            onClick={() => {
              onBack()
              setIsOpen(false)
            }}
            className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-base font-semibold text-muted hover:bg-red-500/10 hover:text-red-500 transition-all"
          >
            <LogOut size={22} />
            Sign Out
          </button>
        </div>
      </aside>
    </div>
  )
}
