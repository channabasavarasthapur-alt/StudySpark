import { LayoutDashboard, BookOpen, GraduationCap, Settings, Home, Clock, LogOut } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { View } from '../../types/navigation'
import { useStudy, type StudySessionSource } from '../../study/studyContext'
import { useAuth } from '../../auth/authContext'

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

function getSessionView(source: StudySessionSource): View {
  if (source === 'capsule') {
    return 'capsules'
  }

  if (source === 'exam-prep') {
    return 'exams'
  }

  return 'dashboard'
}

export function Dock({ activeView, onNavigate }: DockProps) {
  const { activeSession, elapsedSeconds } = useStudy()
  const { signOut, user } = useAuth()
  const items: { id: View; icon: LucideIcon; label: string }[] = [
    { id: 'landing', icon: Home, label: 'Home' },
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'capsules', icon: BookOpen, label: 'Capsules' },
    { id: 'exams', icon: GraduationCap, label: 'Exams' },
    { id: 'setup', icon: Settings, label: 'Setup' },
  ]

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-full max-w-3xl -translate-x-1/2 px-4 sm:bottom-6">
      {activeSession && (
        <button
          type="button"
          onClick={() => onNavigate(getSessionView(activeSession.source))}
          aria-label={`Return to active ${sourceLabels[activeSession.source]} session, ${formatElapsed(elapsedSeconds)} elapsed`}
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

      <div className="mx-auto flex w-full items-center justify-center gap-2">
        <nav className="flex min-w-0 flex-1 items-center gap-1 rounded-xl border border-border bg-card p-1.5 shadow-lg transition-colors duration-200 sm:max-w-2xl">
          {items.map((item) => {
            const isActive = activeView === item.id
            const Icon = item.icon

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                className={`group relative flex h-12 flex-1 min-w-0 items-center justify-center rounded-lg transition-colors duration-200 ${
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
        <button
          type="button"
          onClick={() => void signOut()}
          aria-label={user?.email ? `Log out ${user.email}` : 'Log out'}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-card text-red-500 shadow-lg transition-colors duration-200 hover:bg-red-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          title="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  )
}
