import { useMemo } from 'react'
import {
  ArrowLeft,
  AlertTriangle,
  BookOpen,
  CalendarClock,
  ChevronDown,
  Target,
  Trophy,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { ReadinessBar } from '../components/ui/ReadinessBar'
import { ThemeToggle } from '../components/ThemeToggle'
import type { View } from '../types/navigation'
import { useStudy, useStudyTimer, type StudySession, type CompletedStudyPlanTask } from '../study/studyContext'
import { getLocalDateKey, parseSetupSubjects, useSetupPreferences } from '../study/setupPreferences'

interface ExamsPageProps {
  onNavigate: (view: View) => void
}

function formatExamDate(examDate?: string) {
  if (!examDate) {
    return 'Not set'
  }

  const parsedDate = new Date(`${examDate}T00:00:00`)
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Not set'
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(parsedDate)
}

function formatCountdown(examDate?: string) {
  if (!examDate) {
    return {
      label: 'Not set',
      helper: 'Add an exam date in setup.',
      urgency: 'neutral' as const,
    }
  }

  const today = new Date()
  const target = new Date(`${examDate}T00:00:00`)
  today.setHours(0, 0, 0, 0)

  const diffTime = target.getTime() - today.getTime()
  if (Number.isNaN(diffTime)) {
    return {
      label: 'Not set',
      helper: 'Add a valid exam date in setup.',
      urgency: 'neutral' as const,
    }
  }

  const daysRemaining = Math.ceil(diffTime / 86400000)

  if (daysRemaining < 0) {
    return {
      label: 'Exam passed',
      helper: 'Update your exam date in setup.',
      urgency: 'neutral' as const,
    }
  }

  if (daysRemaining === 0) {
    return {
      label: 'Today',
      helper: 'Keep the final review focused.',
      urgency: 'high' as const,
    }
  }

  return {
    label: `${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`,
    helper: daysRemaining <= 7 ? 'Prioritize weak areas this week.' : 'Steady progress still matters most.',
    urgency: daysRemaining <= 7 ? ('high' as const) : ('neutral' as const),
  }
}

function getWeekStart(date: Date) {
  const weekStart = new Date(date)
  const day = weekStart.getDay()
  const diff = day === 0 ? -6 : 1 - day
  weekStart.setDate(weekStart.getDate() + diff)
  weekStart.setHours(0, 0, 0, 0)

  return weekStart
}

function getWeekEnd(date: Date) {
  const weekEnd = getWeekStart(date)
  weekEnd.setDate(weekEnd.getDate() + 7)

  return weekEnd
}

function getSubjectReadiness(
  subject: string,
  combinedSessions: StudySession[],
  dailyStudyMinutes: number,
  subjectCount: number,
) {
  const subjectSessions = combinedSessions.filter((session) =>
    session.title.toLowerCase().includes(subject.toLowerCase()),
  )
  const studiedMinutes = subjectSessions.reduce(
    (total, session) => total + session.durationMinutes,
    0,
  )
  const plannedMinutes = subjectSessions.reduce(
    (total, session) => total + session.plannedMinutes,
    0,
  )
  const dailySubjectMinutes =
    subjectCount > 0 ? Math.max(1, Math.round(dailyStudyMinutes / subjectCount)) : 0
  const finalPlannedMinutes = Math.max(plannedMinutes, dailySubjectMinutes)

  const readiness =
    finalPlannedMinutes > 0 ? Math.min(100, Math.round((studiedMinutes / finalPlannedMinutes) * 100)) : 0

  return {
    readiness,
    studiedMinutes,
    sessions: subjectSessions.filter(s => s.id.startsWith('demo-session-') || s.id.includes('-')).length,
    completedTasks: subjectSessions.filter(s => s.id.includes('-completed') || !s.id.includes('-session-')).length,
  }
}

function getRecommendedSubject(
  subjectReadiness: { subject: string; readiness: number; studiedMinutes: number }[],
  activeTitle?: string,
) {
  if (activeTitle) {
    return {
      subject: activeTitle,
      description: 'Continue the active session before starting new exam prep.',
      minutes: 'In progress',
    }
  }

  const nextSubject = [...subjectReadiness].sort((first, second) => {
    if (first.readiness === second.readiness) {
      return first.studiedMinutes - second.studiedMinutes
    }

    return first.readiness - second.readiness
  })[0]

  if (!nextSubject) {
    return {
      subject: 'Set up subjects',
      description: 'Add subjects in setup to generate exam recommendations.',
      minutes: '20m',
    }
  }

  return {
    subject: nextSubject.subject,
    description: `${nextSubject.subject} has the lowest readiness signal right now.`,
    minutes: '25m',
  }
}

function getCombinedSessions(sessions: StudySession[], completedTasks: CompletedStudyPlanTask[]): StudySession[] {
  const completedTaskSessions: StudySession[] = completedTasks.map((task) => ({
    id: task.id,
    source: 'revision',
    title: task.title,
    startedAt: task.completedAt,
    completedAt: task.completedAt,
    durationMinutes: task.durationMinutes,
    plannedMinutes: task.durationMinutes,
  }))

  const combined = [...sessions]

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

export default function ExamsPage({ onNavigate }: ExamsPageProps) {
  const {
    activeSession,
    endSession,
    metrics,
    pauseSession,
    resumeSession,
    sessions,
    startSession,
    completedTasks,
  } = useStudy()
  const { elapsedSeconds } = useStudyTimer()
  const setupPreferences = useSetupPreferences()
  const subjects = useMemo(
    () => parseSetupSubjects(setupPreferences.subjects, []),
    [setupPreferences.subjects],
  )
  const dailyStudyMinutes =
    typeof setupPreferences.dailyStudyMinutes === 'number' &&
    Number.isFinite(setupPreferences.dailyStudyMinutes)
      ? Math.max(0, setupPreferences.dailyStudyMinutes)
      : 90
  const availableDays = Object.values(setupPreferences.weeklyAvailability).filter(Boolean).length
  const hasExamConfigured = Boolean(setupPreferences.examDate)
  const countdown = useMemo(
    () => formatCountdown(setupPreferences.examDate),
    [setupPreferences.examDate],
  )
  const todayKey = getLocalDateKey(new Date())
  const weekStart = useMemo(() => getWeekStart(new Date(todayKey)), [todayKey])
  const weekEnd = useMemo(() => getWeekEnd(new Date(todayKey)), [todayKey])

  const completedSessionsThisWeek = useMemo(() => {
    return sessions.filter((session) => {
      const completedAt = new Date(session.completedAt)
      return completedAt >= weekStart && completedAt < weekEnd
    })
  }, [sessions, weekStart, weekEnd])

  const weeklyCombined = useMemo(() => {
    return getCombinedSessions(
      completedSessionsThisWeek,
      completedTasks.filter((task) => {
        const completedAt = new Date(task.completedAt)
        return completedAt >= weekStart && completedAt < weekEnd
      })
    )
  }, [completedSessionsThisWeek, completedTasks, weekStart, weekEnd])

  const completedMinutesThisWeek = useMemo(() => {
    return weeklyCombined.reduce((total, item) => total + item.durationMinutes, 0)
  }, [weeklyCombined])

  const totalPlannedMinutesThisWeek = dailyStudyMinutes * availableDays
  const weeklyCompletionPercentage =
    totalPlannedMinutesThisWeek > 0
      ? Math.min(
          100,
          Math.round((completedMinutesThisWeek / totalPlannedMinutesThisWeek) * 100),
        )
      : 0

  const combinedSessions = useMemo(() => {
    return getCombinedSessions(sessions, completedTasks)
  }, [sessions, completedTasks])

  const subjectReadiness = subjects.map((subject) => ({
    subject,
    ...getSubjectReadiness(subject, combinedSessions, dailyStudyMinutes, subjects.length),
  }))
  const recommendedSubject = getRecommendedSubject(subjectReadiness, activeSession?.title)
  const averageSubjectReadiness =
    subjectReadiness.length > 0
      ? Math.round(
          subjectReadiness.reduce((total, subject) => total + subject.readiness, 0) /
            subjectReadiness.length,
        )
      : metrics.readinessPercentage
  const examConfidence = Math.round(
    (averageSubjectReadiness + metrics.readinessPercentage + weeklyCompletionPercentage) / 3,
  )
  const confidenceLabel =
    examConfidence >= 75 ? 'Strong' : examConfidence >= 45 ? 'Building' : 'Needs focus'
  const revisionPriorities = [...subjectReadiness]
    .sort((first, second) => first.readiness - second.readiness || first.studiedMinutes - second.studiedMinutes)
    .slice(0, 3)

  const handleStartRecommendedSubject = () => {
    if (activeSession) {
      return
    }

    if (!hasExamConfigured || !subjects.includes(recommendedSubject.subject)) {
      onNavigate('setup')
      return
    }

    startSession({
      source: 'exam-prep',
      title: `${recommendedSubject.subject} exam review`,
      plannedMinutes: Number.parseInt(recommendedSubject.minutes.replace(/\D/g, ''), 10) || 25,
    })
  }

  const activeMinutes = Math.floor(elapsedSeconds / 60)
  const activeSeconds = elapsedSeconds % 60
  const activeElapsedDisplay = `${activeMinutes}:${String(activeSeconds).padStart(2, '0')}`

  return (
    <div className="min-h-screen bg-background pb-[calc(8rem+env(safe-area-inset-bottom))] transition-colors duration-500 sm:pb-[calc(6rem+env(safe-area-inset-bottom))]">
      {/* Header */}
      <header className="mx-auto max-w-2xl px-5 pt-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('dashboard')}
            className="gap-2 text-muted hover:text-foreground"
          >
            <ArrowLeft size={15} />
            Back to dashboard
          </Button>
          <ThemeToggle />
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple">
            Revision Planner
          </p>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Exam Prep & Priorities
          </h1>
        </div>
      </header>

      <main className="mx-auto mt-6 max-w-2xl px-5 space-y-6">
        {/* Countdown Banner */}
        {hasExamConfigured && (
          <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <CalendarClock className="text-purple shrink-0" size={20} />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Exam Date: {formatExamDate(setupPreferences.examDate)}
                </p>
                <p className="text-[11px] text-muted">{countdown.helper}</p>
              </div>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                countdown.urgency === 'high'
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                  : 'bg-purple/10 text-purple border border-purple/20'
              }`}
            >
              {countdown.label}
            </span>
          </div>
        )}

        {/* Needs Setup Prompt */}
        {!hasExamConfigured && (
          <section className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center space-y-4">
            <div className="mx-auto grid size-12 place-items-center rounded-xl border border-border bg-background text-muted">
              <CalendarClock size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Set exam details</h2>
              <p className="mt-1 max-w-xs mx-auto text-xs leading-relaxed text-muted">
                Add your target exam date and subjects in setup to calculate countdown, topic readiness, and study plans.
              </p>
            </div>
            <div className="pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('setup')}
              >
                Configure Plan
              </Button>
            </div>
          </section>
        )}

        {/* Recommended Review Session Action (Promoted) */}
        {hasExamConfigured && (
          <section className="rounded-2xl border border-purple/20 bg-gradient-to-br from-card to-background p-6 shadow-sm space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 rounded-full border border-purple/10 bg-purple/5 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-purple">
                  <Target size={10} /> Recommended Revision Block
                </span>
                <h2 className="text-xl font-black text-foreground pt-1.5">
                  {recommendedSubject.subject}
                </h2>
                <p className="text-xs text-muted leading-relaxed">
                  {recommendedSubject.description}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-muted">
                  Target Length
                </span>
                <span className="block text-2xl font-black text-foreground mt-0.5">
                  {recommendedSubject.minutes}
                </span>
              </div>
            </div>

            {/* Session Actions */}
            <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-start">
              <Button
                onClick={handleStartRecommendedSubject}
                disabled={Boolean(activeSession)}
                className="w-full sm:w-auto gap-2 min-h-12 text-sm shadow-sm"
              >
                <BookOpen size={15} />
                Start Review Session
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigate('setup')}
                className="w-full sm:w-auto gap-2 min-h-12 text-sm"
              >
                Adjust Plan
              </Button>
            </div>

            {/* Active Session timer */}
            {activeSession && (
              <div className="rounded-xl border border-purple/20 bg-purple/5 p-4 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-purple">
                      Active Revision Timer
                    </span>
                    <h3 className="text-sm font-bold text-foreground mt-0.5">
                      {activeSession.title}
                    </h3>
                    <p className="text-xs text-muted mt-0.5">
                      {activeElapsedDisplay} elapsed ({activeSession.status})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeSession.status === 'running' ? (
                      <Button variant="outline" size="sm" onClick={pauseSession}>
                        Pause
                      </Button>
                    ) : (
                      <Button variant="secondary" size="sm" onClick={resumeSession}>
                        Resume
                      </Button>
                    )}
                    <Button
                      variant="danger"
                      size="sm"
                      className="border-red-500/10 bg-red-500/5 hover:bg-red-500/10 text-red-500"
                      onClick={endSession}
                    >
                      End
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Prioritized Weakest Subjects (Syllabus Readiness Map) */}
        {hasExamConfigured && subjectReadiness.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted">
                Syllabus Readiness Map
              </h3>
              <span className="text-[11px] font-bold text-muted">
                {averageSubjectReadiness}% average readiness
              </span>
            </div>

            <div className="space-y-2.5">
              {subjectReadiness.map((subject) => (
                <div
                  key={subject.subject}
                  className="rounded-xl border border-border/70 bg-card p-4 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h4 className="font-bold text-foreground truncate text-sm">
                        {subject.subject}
                      </h4>
                      <p className="text-[10px] text-muted mt-0.5">
                        {subject.studiedMinutes}m study logged · {subject.sessions + subject.completedTasks} study signals
                      </p>
                    </div>
                    <span className="text-base font-black text-foreground">
                      {subject.readiness}%
                    </span>
                  </div>

                  <ReadinessBar
                    percentage={subject.readiness}
                    label={`${subject.subject} readiness`}
                    showTooltip={false}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Prioritized focus list (Weakest first) */}
        {hasExamConfigured && revisionPriorities.length > 0 && (
          <section className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted">
              Prioritized Focus List
            </h3>
            <div className="grid gap-2 sm:grid-cols-3">
              {revisionPriorities.map((subject, index) => (
                <div
                  key={subject.subject}
                  className="rounded-xl border border-border/80 bg-card/60 p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-purple/10 text-[9px] font-bold text-purple">
                      {index + 1}
                    </span>
                    <span className="text-xs font-semibold text-foreground truncate">
                      {subject.subject}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-muted">
                    {subject.readiness}%
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Collapsible secondary metrics drawer */}
        {hasExamConfigured && (
          <section className="pt-2">
            <details className="group rounded-2xl border border-border bg-card p-4 transition-all">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 min-h-[44px]">
                <div className="flex items-center gap-2.5">
                  <Trophy size={16} className="text-purple" />
                  <span className="text-xs font-bold uppercase tracking-widest text-muted">
                    Exam Prep Insights & History Logs
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className="shrink-0 text-muted transition-transform group-open:rotate-180"
                />
              </summary>

              <div className="mt-5 border-t border-border/60 pt-5 space-y-6">
                {/* Confidence banner */}
                <div className="rounded-xl border border-purple/10 bg-purple/5 p-4 space-y-3">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Exam Confidence Score
                      </p>
                      <h4 className="text-2xl font-black text-foreground mt-1">
                        {examConfidence}% ({confidenceLabel})
                      </h4>
                    </div>
                    <Trophy size={24} className="text-purple mb-1" />
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/10">
                    <div
                      className="h-full rounded-full bg-purple"
                      style={{ width: `${examConfidence}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted leading-relaxed">
                    Combines average syllabus readiness ({averageSubjectReadiness}%), study consistency ({metrics.readinessPercentage}%), and week target completion ({weeklyCompletionPercentage}%).
                  </p>
                </div>

                {/* Sub metrics grid */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Syllabus', value: `${averageSubjectReadiness}%` },
                    { label: 'Consistency', value: `${metrics.readinessPercentage}%` },
                    { label: 'Weekly Target', value: `${weeklyCompletionPercentage}%` },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-background border border-border p-3 text-center">
                      <p className="text-lg font-black text-foreground">{item.value}</p>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted mt-0.5">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Weekly progress bar */}
                <div className="rounded-xl border border-border bg-background/30 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-muted">WEEKLY COMPLETION SIGNAL</span>
                    <span className="text-foreground">{weeklyCompletionPercentage}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/10">
                    <div
                      className="h-full rounded-full bg-purple"
                      style={{ width: `${weeklyCompletionPercentage}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted">
                    {completedMinutesThisWeek}m of {totalPlannedMinutesThisWeek}m logged this week
                  </p>
                </div>

                {/* Warning message inside final stretch */}
                {countdown.urgency === 'high' && (
                  <div className="flex gap-3 rounded-xl border border-red-500/10 bg-red-500/5 p-4 text-red-500">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-xs">Final stretch alert</p>
                      <p className="mt-1 text-[11px] leading-relaxed">
                        Exam date is approaching within 7 days. Focus prep sessions strictly on subjects with lowest readiness scores first.
                      </p>
                    </div>
                  </div>
                )}

                {/* Recent activity log */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted">
                    Recent Exam Signals
                  </h4>
                  {metrics.recentActivity.length > 0 ? (
                    <div className="space-y-2">
                      {metrics.recentActivity.slice(0, 3).map((session) => (
                        <div
                          key={session.id}
                          className="rounded-xl border border-border bg-background/40 p-3 text-xs leading-relaxed text-muted"
                        >
                          <p className="font-semibold text-foreground truncate">{session.title}</p>
                          <p className="mt-0.5">
                            {session.durationMinutes}m completed of {session.plannedMinutes}m target
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs leading-relaxed text-muted">
                      No logs recorded. Start recommended exam reviews to display entries here.
                    </p>
                  )}
                </div>
              </div>
            </details>
          </section>
        )}
      </main>
    </div>
  )
}
