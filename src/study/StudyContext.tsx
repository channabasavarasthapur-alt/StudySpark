import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  StudyContext,
  type ActiveStudySession,
  type StartSessionInput,
  type StudyContextValue,
  type StudyMetrics,
  type StudySession,
} from './studyContext'
import { getLocalDateKey } from './setupPreferences'

const SESSIONS_STORAGE_KEY = 'studyspark-study-sessions'
const ACTIVE_SESSION_STORAGE_KEY = 'studyspark-active-session'

function isStudySession(value: unknown): value is StudySession {
  if (!value || typeof value !== 'object') {
    return false
  }

  const session = value as Partial<StudySession>

  return (
    typeof session.id === 'string' &&
    (session.source === 'capsule' ||
      session.source === 'mission' ||
      session.source === 'revision' ||
      session.source === 'exam-prep' ||
      session.source === 'pomodoro') &&
    typeof session.title === 'string' &&
    (session.relatedCapsuleId === undefined || typeof session.relatedCapsuleId === 'string') &&
    typeof session.startedAt === 'string' &&
    typeof session.completedAt === 'string' &&
    typeof session.durationMinutes === 'number' &&
    typeof session.plannedMinutes === 'number'
  )
}

function isActiveStudySession(value: unknown): value is ActiveStudySession {
  if (!value || typeof value !== 'object') {
    return false
  }

  const session = value as Partial<ActiveStudySession>

  return (
    typeof session.id === 'string' &&
    (session.source === 'capsule' ||
      session.source === 'mission' ||
      session.source === 'revision' ||
      session.source === 'exam-prep' ||
      session.source === 'pomodoro') &&
    typeof session.title === 'string' &&
    (session.relatedCapsuleId === undefined || typeof session.relatedCapsuleId === 'string') &&
    typeof session.startedAt === 'string' &&
    typeof session.plannedMinutes === 'number' &&
    (session.status === 'running' || session.status === 'paused') &&
    typeof session.accumulatedPausedMs === 'number' &&
    (session.pausedAt === undefined || typeof session.pausedAt === 'string')
  )
}

function loadSessions(): StudySession[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedSessions = window.localStorage.getItem(SESSIONS_STORAGE_KEY)
    const parsedSessions: unknown = storedSessions ? JSON.parse(storedSessions) : []

    return Array.isArray(parsedSessions) ? parsedSessions.filter(isStudySession) : []
  } catch {
    return []
  }
}

function loadActiveSession(): ActiveStudySession | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const storedSession = window.localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY)
    const parsedSession: unknown = storedSession ? JSON.parse(storedSession) : null

    return isActiveStudySession(parsedSession) ? parsedSession : null
  } catch {
    return null
  }
}

function getDateKey(date: Date) {
  return getLocalDateKey(date)
}

function calculateElapsedMs(session: ActiveStudySession | null, now: number) {
  if (!session) {
    return 0
  }

  const startedAtMs = new Date(session.startedAt).getTime()
  const currentMs = session.status === 'paused' && session.pausedAt ? new Date(session.pausedAt).getTime() : now

  return Math.max(0, currentMs - startedAtMs - session.accumulatedPausedMs)
}

function calculateCurrentStreak(sessions: StudySession[]) {
  const studiedDays = new Set(sessions.map((session) => getDateKey(new Date(session.completedAt))))
  let streak = 0
  const cursor = new Date()

  while (studiedDays.has(getDateKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

function calculateReadinessPercentage(sessions: StudySession[]) {
  const plannedMinutes = sessions.reduce((total, session) => total + Math.max(0, session.plannedMinutes), 0)

  if (plannedMinutes === 0) {
    return 0
  }

  const completedMinutes = sessions.reduce((total, session) => total + Math.max(0, session.durationMinutes), 0)

  return Math.min(100, Math.round((completedMinutes / plannedMinutes) * 100))
}

function calculateMetrics(sessions: StudySession[]): StudyMetrics {
  const sortedSessions = [...sessions].sort(
    (first, second) => new Date(second.completedAt).getTime() - new Date(first.completedAt).getTime(),
  )
  const completedSessions = sessions.length

  return {
    totalStudyMinutes: sessions.reduce((total, session) => total + Math.max(0, session.durationMinutes), 0),
    completedSessions,
    currentStreak: calculateCurrentStreak(sessions),
    readinessPercentage: calculateReadinessPercentage(sessions),
    mastered: completedSessions,
    toReview: sessions.filter((session) => session.durationMinutes < session.plannedMinutes).length,
    recentActivity: sortedSessions.slice(0, 4),
  }
}

export function StudyProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<StudySession[]>(loadSessions)
  const [activeSession, setActiveSession] = useState<ActiveStudySession | null>(loadActiveSession)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    window.localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions))
  }, [sessions])

  useEffect(() => {
    if (activeSession) {
      window.localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(activeSession))
    } else {
      window.localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY)
    }
  }, [activeSession])

  useEffect(() => {
    if (activeSession?.status !== 'running') {
      return
    }

    const intervalId = window.setInterval(() => setNow(Date.now()), 1000)

    return () => window.clearInterval(intervalId)
  }, [activeSession?.status])

  const metrics = useMemo(() => calculateMetrics(sessions), [sessions])
  const elapsedSeconds = Math.floor(calculateElapsedMs(activeSession, now) / 1000)

  const value = useMemo<StudyContextValue>(
    () => ({
      sessions,
      activeSession,
      metrics,
      elapsedSeconds,
      startSession: ({ source, title, plannedMinutes, relatedCapsuleId }: StartSessionInput) => {
        setActiveSession((currentSession) => {
          if (currentSession) {
            return currentSession
          }

          const startedAt = new Date()

          return {
            id: `${source}-${startedAt.getTime()}`,
            source,
            title,
            relatedCapsuleId,
            startedAt: startedAt.toISOString(),
            plannedMinutes: Math.max(1, Math.round(plannedMinutes)),
            status: 'running',
            accumulatedPausedMs: 0,
          }
        })
        setNow(Date.now())
      },
      seedDemoSessions: (demoSessions: StudySession[]) => {
        setActiveSession(null)
        setSessions(demoSessions)
        setNow(Date.now())
      },
      resetStudySessions: () => {
        setActiveSession(null)
        setSessions([])
        setNow(Date.now())
      },
      removeCapsuleStudyState: ({ capsuleId, title }) => {
        setActiveSession((currentSession) => {
          if (
            !currentSession ||
            currentSession.source !== 'capsule' ||
            (currentSession.relatedCapsuleId !== capsuleId &&
              !(currentSession.relatedCapsuleId === undefined && currentSession.title === title))
          ) {
            return currentSession
          }

          return null
        })
        setSessions((currentSessions) =>
          currentSessions.filter(
            (session) =>
              session.source !== 'capsule' ||
              (session.relatedCapsuleId !== capsuleId && !(session.relatedCapsuleId === undefined && session.title === title)),
          ),
        )
        setNow(Date.now())
      },
      pauseSession: () => {
        setActiveSession((currentSession) => {
          if (!currentSession || currentSession.status === 'paused') {
            return currentSession
          }

          return {
            ...currentSession,
            status: 'paused',
            pausedAt: new Date().toISOString(),
          }
        })
        setNow(Date.now())
      },
      resumeSession: () => {
        setActiveSession((currentSession) => {
          if (!currentSession || currentSession.status === 'running' || !currentSession.pausedAt) {
            return currentSession
          }

          const resumedAtMs = Date.now()
          const pausedAtMs = new Date(currentSession.pausedAt).getTime()

          return {
            ...currentSession,
            status: 'running',
            pausedAt: undefined,
            accumulatedPausedMs: currentSession.accumulatedPausedMs + Math.max(0, resumedAtMs - pausedAtMs),
          }
        })
        setNow(Date.now())
      },
      endSession: () => {
        setActiveSession((currentSession) => {
          if (!currentSession) {
            return currentSession
          }

          const completedAt = new Date()
          const durationMinutes = Math.max(1, Math.ceil(calculateElapsedMs(currentSession, completedAt.getTime()) / 60000))

          setSessions((currentSessions) => [
            {
              id: currentSession.id,
              source: currentSession.source,
              title: currentSession.title,
              relatedCapsuleId: currentSession.relatedCapsuleId,
              startedAt: currentSession.startedAt,
              completedAt: completedAt.toISOString(),
              durationMinutes,
              plannedMinutes: currentSession.plannedMinutes,
            },
            ...currentSessions,
          ])

          return null
        })
        setNow(Date.now())
      },
      deleteSession: (sessionId: string) => {
        setSessions((currentSessions) => currentSessions.filter((session) => session.id !== sessionId))
      },
    }),
    [activeSession, elapsedSeconds, metrics, sessions],
  )

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>
}
