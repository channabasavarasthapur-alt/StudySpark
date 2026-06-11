import { LayoutDashboard, BookOpen, GraduationCap, Settings, Home } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { View } from '../../types/navigation'

interface DockProps {
  activeView: View
  onNavigate: (view: View) => void
}

export function Dock({ activeView, onNavigate }: DockProps) {
  const items: { id: View; icon: LucideIcon; label: string }[] = [
    { id: 'landing', icon: Home, label: 'Home' },
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dash' },
    { id: 'capsules', icon: BookOpen, label: 'Caps' },
    { id: 'exams', icon: GraduationCap, label: 'Exams' },
    { id: 'setup', icon: Settings, label: 'Setup' },
  ]

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 px-4 w-full max-w-fit">
      <nav className="flex items-center gap-1 rounded-[2rem] border border-white/10 bg-black/40 p-2 backdrop-blur-2xl shadow-2xl transition-all duration-500 hover:border-white/20">
        {items.map((item) => {
          const isActive = activeView === item.id
          const Icon = item.icon

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`group relative flex h-12 flex-1 min-w-[3rem] sm:min-w-[4rem] items-center justify-center rounded-full transition-all duration-300 ${
                isActive
                  ? 'bg-white text-black scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                  : 'text-white/40 hover:bg-white/5 hover:text-white'
              }`}
              title={item.label}
            >
              <div className="flex flex-col items-center">
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`mt-0.5 hidden text-[8px] font-black uppercase tracking-tighter sm:block ${isActive ? 'text-black' : 'text-white/40'}`}>
                   {item.label}
                </span>
              </div>

              {/* Active Indicator Dot */}
              {isActive && (
                <span className="absolute -bottom-1 size-1 rounded-full bg-black sm:hidden" />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
