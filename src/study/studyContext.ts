import { createContext, useContext } from 'react'

export type StudySessionSource = 'capsule' | 'mission' | 'revision' | 'exam-prep' | 'pomodoro'

export interface StudySession {
  id: string
  source: StudySessionSource
  title: string
  relatedCapsuleId?: string
  startedAt: string
  completedAt: string
  durationMinutes: number
  plannedMinutes: number
}

export interface ActiveStudySession {
  id: string
  source: StudySessionSource
  title: string
  relatedCapsuleId?: string
  startedAt: string
  plannedMinutes: number
  status: 'running' | 'paused'
  pausedAt?: string
  accumulatedPausedMs: number
}

export interface StudyMetrics {
  totalStudyMinutes: number
  completedSessions: number
  currentStreak: number
  readinessPercentage: number
  mastered: number
  toReview: number
  recentActivity: StudySession[]
}

export interface CompletedStudyPlanTask {
  id: string
  title: string
  subject: string
  durationMinutes: number
  completedAt: string
  dateKey: string
}

export interface StartSessionInput {
  source: StudySessionSource
  title: string
  plannedMinutes: number
  relatedCapsuleId?: string
}

export interface CapsuleStudyStateInput {
  capsuleId: string
  title: string
}

export interface StudyContextValue {
  sessions: StudySession[]
  activeSession: ActiveStudySession | null
  metrics: StudyMetrics
  completedTasks: CompletedStudyPlanTask[]
  completeTask: (task: { id: string; title: string; subject: string; durationMinutes: number; dateKey: string }) => void
  startSession: (session: StartSessionInput) => void
  seedDemoSessions: (sessions: StudySession[]) => void
  resetStudySessions: () => void
  removeCapsuleStudyState: (capsule: CapsuleStudyStateInput) => void
  pauseSession: () => void
  resumeSession: () => void
  endSession: () => void
  deleteSession: (sessionId: string) => void
}

export const StudyContext = createContext<StudyContextValue | undefined>(undefined)

export function useStudy() {
  const context = useContext(StudyContext)

  if (!context) {
    throw new Error('useStudy must be used inside StudyProvider')
  }

  return context
}

export interface StudyTimerContextValue {
  elapsedSeconds: number
}

export const StudyTimerContext = createContext<StudyTimerContextValue | undefined>(undefined)

export function useStudyTimer() {
  const context = useContext(StudyTimerContext)

  if (!context) {
    throw new Error('useStudyTimer must be used inside StudyTimerProvider')
  }

  return context
}
