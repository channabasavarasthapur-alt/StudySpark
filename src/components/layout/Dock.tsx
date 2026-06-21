import { LayoutDashboard, BookOpen, GraduationCap, Settings, Home, Clock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { View } from '../../types/navigation'
import { useStudy, type StudySessionSource } from '../../study/studyContext'

interface DockProps {
  activeView: View
  onNavigate: (view: View) => void
}

const sourceLabels: Record<StudySessionSource, string> = {
  capsule: 'Capsule',
  mission: 'Mission',
  revision: 'Revision',
  'exam-prep': 'Exam prep',
  pomodoro: 'Pomodoro',
}

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

export function Dock({ activeView, onNavigate }: DockProps) {
  const { activeSession, elapsedSeconds } = useStudy()
  const items: { id: View; icon: LucideIcon; label: string }[] = [
    { id: 'landing', icon: Home, label: 'Home' },
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'capsules', icon: BookOpen, label: 'Capsules' },
    { id: 'exams', icon: GraduationCap, label: 'Exams' },
    { id: 'setup', icon: Settings, label: 'Setup' },
  ]

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 px-4 sm:bottom-6">
      {activeSession && (
        <button
          type="button"
          onClick={() => onNavigate(activeSession.source === 'capsule' ? 'capsules' : 'dashboard')}
          className="nav-session-pill mx-auto mb-2 flex w-fit max-w-full items-center gap-2 rounded-full border border-purple/20 bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-lg transition-colors duration-200 hover:border-purple/35 hover:bg-purple/5"
          title="Return to active study session"
        >
          <Clock size={14} className="text-purple" />
          <span className="truncate">{sourceLabels[activeSession.source]} session</span>
          <span className="text-muted">{formatElapsed(elapsedSeconds)}</span>
          <span className="rounded-full bg-purple/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-purple">
            {activeSession.status}
          </span>
        </button>
      )}

      <nav className="mx-auto flex items-center gap-1 rounded-2xl border border-border bg-card p-1.5 shadow-2xl transition-colors duration-200">
        {items.map((item) => {
          const isActive = activeView === item.id
          const Icon = item.icon

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`group relative flex h-12 flex-1 min-w-0 items-center justify-center rounded-xl transition-colors duration-200 ${
                isActive
                  ? 'bg-purple text-purple-foreground shadow-sm'
                  : 'text-muted hover:bg-foreground/5 hover:text-foreground'
              }`}
              title={item.label}
            >
              <div className="flex flex-col items-center">
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`mt-0.5 hidden text-[9px] font-semibold tracking-tight sm:block ${isActive ? 'text-purple-foreground' : 'text-muted'}`}>
                  {item.label}
                </span>
              </div>

              {isActive && (
                <span className="absolute -bottom-1 size-1 rounded-full bg-purple-foreground sm:hidden" />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
