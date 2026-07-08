import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  StudyContext,
  StudyTimerContext,
  type ActiveStudySession,
  type StartSessionInput,
  type StudyContextValue,
  type StudyMetrics,
  type StudySession,
  type CompletedStudyPlanTask,
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
}function getCombinedSessions(sessions: StudySession[], completedTasks: CompletedStudyPlanTask[]): StudySession[] {
  const completedTaskSessions: StudySession[] = completedTasks.map((task) => ({
    id: task.id,
    source: 'revision',
    title: task.title,
    startedAt: task.completedAt,
    completedAt: task.completedAt,
    durationMinutes: task.durationMinutes,
    plannedMinutes: task.durationMinutes,
  }))

  const combined: StudySession[] = [...sessions]

  const sessionKeys = new Set(
    sessions.map((s) => {
      const date = getLocalDateKey(new Date(s.completedAt))
      const titleLower = s.title.toLowerCase()
      return `${date}-${titleLower}`
    })
  )

  for (const taskSession of completedTaskSessions) {
    const taskDate = getLocalDateKey(new Date(taskSession.completedAt))
    const taskSubjectLower = taskSession.title.split(' ')[0]?.toLowerCase() || ''
    
    const isAlreadyCovered = Array.from(sessionKeys).some((key) => {
      return key.startsWith(taskDate) && key.includes(taskSubjectLower)
    })

    if (!isAlreadyCovered) {
      combined.push(taskSession)
    }
  }

  return combined
}

function calculateCurrentStreak(sessions: StudySession[]) {
  const studiedDays = new Set(sessions.map((session) => getDateKey(new Date(session.completedAt))))
  let streak = 0
  const cursor = new Date()

  if (!studiedDays.has(getDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!studiedDays.has(getDateKey(cursor))) {
      return 0
    }
  }

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
  const [completedTasks, setCompletedTasks] = useState<CompletedStudyPlanTask[]>(() => {
    try {
      const stored = localStorage.getItem('studyspark.completedStudyPlanTasks')
      const parsedValue = stored ? JSON.parse(stored) : []
      if (!Array.isArray(parsedValue)) {
        return []
      }
      return parsedValue.filter((task): task is CompletedStudyPlanTask => {
        const possibleTask = task as Partial<CompletedStudyPlanTask>
        return (
          typeof possibleTask.id === 'string' &&
          typeof possibleTask.title === 'string' &&
          typeof possibleTask.subject === 'string' &&
          typeof possibleTask.durationMinutes === 'number' &&
          typeof possibleTask.completedAt === 'string' &&
          typeof possibleTask.dateKey === 'string'
        )
      })
    } catch {
      return []
    }
  })

  useEffect(() => {
    const handleStorage = () => {
      try {
        const stored = localStorage.getItem('studyspark.completedStudyPlanTasks')
        const parsedValue = stored ? JSON.parse(stored) : []
        if (Array.isArray(parsedValue)) {
          setCompletedTasks(parsedValue.filter((task): task is CompletedStudyPlanTask => {
            const possibleTask = task as Partial<CompletedStudyPlanTask>
            return (
              typeof possibleTask.id === 'string' &&
              typeof possibleTask.title === 'string' &&
              typeof possibleTask.subject === 'string' &&
              typeof possibleTask.durationMinutes === 'number' &&
              typeof possibleTask.completedAt === 'string' &&
              typeof possibleTask.dateKey === 'string'
            )
          }))
        } else {
          setCompletedTasks([])
        }
      } catch (e) {
        console.error('Failed to load completed tasks in StudyContext:', e)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('studyspark.completedStudyPlanTasks', JSON.stringify(completedTasks))
    } catch (e) {
      console.error('Failed to save completed tasks to localStorage:', e)
    }
  }, [completedTasks])

  useEffect(() => {
    try {
      window.localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions))
    } catch (e) {
      console.error('Failed to save study sessions to localStorage:', e)
    }
  }, [sessions])
  useEffect(() => {
    try {
      if (activeSession) {
        window.localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(activeSession))
      } else {
        window.localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY)
      }
    } catch (e) {
      console.error('Failed to update active session in localStorage:', e)
    }
  }, [activeSession])

  const combinedSessions = useMemo(() => {
    return getCombinedSessions(sessions, completedTasks)
  }, [sessions, completedTasks])

  const metrics = useMemo(() => calculateMetrics(combinedSessions), [combinedSessions])

  const value = useMemo<StudyContextValue>(
    () => ({
      sessions,
      activeSession,
      metrics,
      completedTasks,
      completeTask: (task) => {
        setCompletedTasks((currentTasks) => {
          if (currentTasks.some((t) => t.id === task.id)) {
            return currentTasks
          }
          const newTask: CompletedStudyPlanTask = {
            id: task.id,
            title: task.title,
            subject: task.subject,
            durationMinutes: task.durationMinutes,
            completedAt: new Date().toISOString(),
            dateKey: task.dateKey,
          }
          return [newTask, ...currentTasks]
        })
      },
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
      },
      seedDemoSessions: (demoSessions: StudySession[]) => {
        setActiveSession(null)
        setSessions(demoSessions)
      },
      resetStudySessions: () => {
        setActiveSession(null)
        setSessions([])
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
          currentSessions.map((session) => {
            if (
              session.source === 'capsule' &&
              (session.relatedCapsuleId === capsuleId ||
                (session.relatedCapsuleId === undefined && session.title === title))
            ) {
              return {
                ...session,
                relatedCapsuleId: undefined,
              }
            }
            return session
          }),
        )
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
      },
      endSession: () => {
        if (!activeSession) {
          return
        }

        const completedAt = new Date()
        const durationMinutes = Math.max(1, Math.ceil(calculateElapsedMs(activeSession, completedAt.getTime()) / 60000))

        const newSession = {
          id: activeSession.id,
          source: activeSession.source,
          title: activeSession.title,
          relatedCapsuleId: activeSession.relatedCapsuleId,
          startedAt: activeSession.startedAt,
          completedAt: completedAt.toISOString(),
          durationMinutes,
          plannedMinutes: activeSession.plannedMinutes,
        }

        setSessions((currentSessions) => [newSession, ...currentSessions])

        try {
          const storedPrefs = localStorage.getItem('studyspark.setupPreferences')
          if (storedPrefs) {
            const preferences = JSON.parse(storedPrefs)
            const subjects = (preferences.subjects || '')
              .split(',')
              .map((s: string) => s.trim())
              .filter(Boolean)

            const titleLower = activeSession.title.toLowerCase()
            const matchingSubject = subjects.find((sub: string) => titleLower.includes(sub.toLowerCase()))

            if (matchingSubject) {
              const dateKey = getLocalDateKey(completedAt)
              const taskId = `${dateKey}-${matchingSubject.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
              
              setCompletedTasks((currentTasks) => {
                if (currentTasks.some((t) => t.id === taskId)) {
                  return currentTasks
                }
                const newTask: CompletedStudyPlanTask = {
                  id: taskId,
                  title: `${matchingSubject} study block`,
                  subject: matchingSubject,
                  durationMinutes: newSession.durationMinutes,
                  completedAt: completedAt.toISOString(),
                  dateKey,
                }
                return [newTask, ...currentTasks]
              })
            }
          }
        } catch (e) {
          console.error('Failed to auto-complete plan task:', e)
        }

        setActiveSession(null)
      },
      deleteSession: (sessionId: string) => {
        setSessions((currentSessions) => currentSessions.filter((session) => session.id !== sessionId))
      },
    }),
    [activeSession, metrics, sessions, completedTasks],
  )

  return (
    <StudyContext.Provider value={value}>
      <StudyTimerProvider activeSession={activeSession}>
        {children}
      </StudyTimerProvider>
    </StudyContext.Provider>
  )
}

interface StudyTimerProviderProps {
  children: ReactNode
  activeSession: ActiveStudySession | null
}

export function StudyTimerProvider({ children, activeSession }: StudyTimerProviderProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (activeSession?.status !== 'running') {
      return
    }

    const timeoutId = setTimeout(() => setNow(Date.now()), 0)
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000)

    return () => {
      clearTimeout(timeoutId)
      window.clearInterval(intervalId)
    }
  }, [activeSession?.status])

  const elapsedSeconds = Math.floor(calculateElapsedMs(activeSession, now) / 1000)

  const value = useMemo(() => ({ elapsedSeconds }), [elapsedSeconds])

  return <StudyTimerContext.Provider value={value}>{children}</StudyTimerContext.Provider>
}
