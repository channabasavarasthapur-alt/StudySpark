import { LayoutDashboard, BookOpen, CreditCard, GraduationCap, Settings, LogOut } from 'lucide-react'
import { ThemeToggle } from '../ThemeToggle'

interface SidebarProps {
  onBack?: () => void
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: BookOpen, label: 'Study Capsules' },
  { icon: CreditCard, label: 'Flashcards' },
  { icon: GraduationCap, label: 'Exams' },
  { icon: Settings, label: 'Settings' },
]

export function Sidebar({ onBack }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r border-border bg-card lg:flex">
      <div className="flex items-center justify-between gap-3 px-6 py-8">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-lg bg-purple text-base font-black text-purple-foreground shadow-lg shadow-purple/20">
            S
          </span>
          <span className="text-lg font-bold text-foreground">StudySpark</span>
        </div>
        <ThemeToggle />
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              item.active
                ? 'bg-purple/10 text-purple'
                : 'text-muted hover:bg-muted/10 hover:text-foreground'
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={onBack}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors"
        >
          <LogOut size={20} />
          Back to Landing
        </button>
      </div>
    </aside>
  )
}
