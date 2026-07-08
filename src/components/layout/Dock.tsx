import { useState, useEffect } from 'react'
import { LayoutDashboard, BookOpen, GraduationCap, Settings, Clock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { View } from '../../types/navigation'
import { useStudy, useStudyTimer, type StudySessionSource } from '../../study/studyContext'

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
  const { activeSession } = useStudy()
  const { elapsedSeconds } = useStudyTimer()
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

  useEffect(() => {
    const handleViewportChange = () => {
      if (window.visualViewport) {
        const isFocusedInput = document.activeElement && 
          (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')
        const heightDiff = window.innerHeight - window.visualViewport.height
        setIsKeyboardOpen(Boolean(isFocusedInput && heightDiff > 100))
      }
    }

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        setIsKeyboardOpen(true)
      }
    }

    const handleFocusOut = () => {
      setIsKeyboardOpen(false)
    }

    window.addEventListener('focusin', handleFocusIn)
    window.addEventListener('focusout', handleFocusOut)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange)
    }

    return () => {
      window.removeEventListener('focusin', handleFocusIn)
      window.removeEventListener('focusout', handleFocusOut)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange)
      }
    }
  }, [])

  if (isKeyboardOpen) {
    return null
  }

  const items: { id: View; icon: LucideIcon; label: string }[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'capsules', icon: BookOpen, label: 'Capsules' },
    { id: 'exams', icon: GraduationCap, label: 'Exams' },
    { id: 'setup', icon: Settings, label: 'Setup' },
  ]

  return (
    <div className="fixed inset-x-0 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-50 mx-auto w-full max-w-lg px-3 sm:max-w-3xl sm:px-4">
      {activeSession && (
        <button
          type="button"
          onClick={() => onNavigate(getSessionView(activeSession.source))}
          aria-label={`Return to active ${sourceLabels[activeSession.source]} session, ${formatElapsed(elapsedSeconds)} elapsed`}
          className="nav-session-pill mx-auto mb-2 flex min-h-11 w-fit max-w-full items-center gap-2 rounded-full border border-purple/20 bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-lg transition-colors duration-200 hover:border-purple/35 hover:bg-purple/5"
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

      <div className="mx-auto flex w-full items-center justify-center">
        <nav className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-border bg-card/95 p-2 shadow-lg backdrop-blur transition-colors duration-200 sm:max-w-2xl">
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
                className={`group relative flex h-14 flex-1 min-w-0 items-center justify-center rounded-xl border transition-colors duration-200 sm:h-12 sm:rounded-lg ${
                  isActive
                    ? 'border-purple bg-purple text-purple-foreground shadow-sm'
                    : 'border-border/70 bg-background/60 text-muted hover:bg-foreground/5 hover:text-foreground'
                }`}
                title={item.label}
              >
                <div className="flex flex-col items-center">
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`mt-1 text-[10px] font-semibold tracking-tight sm:mt-0.5 sm:text-[9px] ${isActive ? 'text-purple-foreground' : 'text-muted'}`}>
                    {item.label}
                  </span>
                </div>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
