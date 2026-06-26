import { useMemo } from 'react'
import { ArrowLeft, AlertTriangle, BookOpen, CalendarClock, Pause, Play, Square, Target, Trophy } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { ReadinessBar } from '../components/ui/ReadinessBar'
import { ThemeToggle } from '../components/ThemeToggle'
import type { View } from '../types/navigation'
import { useStudy, type StudySession } from '../study/studyContext'
import { parseSetupSubjects, useSetupPreferences } from '../study/setupPreferences'

interface ExamsPageProps {
  onNavigate: (view: View) => void
}

interface CompletedStudyPlanTask {
  id: string
  title: string
  subject: string
  durationMinutes: number
  completedAt: string
  dateKey: string
}

const completedTasksStorageKey = 'studyspark.completedStudyPlanTasks'

function loadCompletedTasks(): CompletedStudyPlanTask[] {
  try {
    const storedValue = localStorage.getItem(completedTasksStorageKey)
    const parsedValue: unknown = storedValue ? JSON.parse(storedValue) : []

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
}

function formatExamDate(examDate?: string) {
  if (!examDate) {
    return 'Not set'
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${examDate}T00:00:00`))
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
  const daysRemaining = Math.ceil((target.getTime() - today.getTime()) / 86400000)

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
  sessions: StudySession[],
  completedTasks: CompletedStudyPlanTask[],
  dailyStudyMinutes: number,
  subjectCount: number,
) {
  const subjectSessions = sessions.filter((session) => session.title.toLowerCase().includes(subject.toLowerCase()))
  const subjectTasks = completedTasks.filter((task) => task.subject.toLowerCase() === subject.toLowerCase())
  const sessionStudiedMinutes = subjectSessions.reduce((total, session) => total + session.durationMinutes, 0)
  const taskStudiedMinutes = subjectTasks.reduce((total, task) => total + task.durationMinutes, 0)
  const studiedMinutes = sessionStudiedMinutes + taskStudiedMinutes
  const sessionPlannedMinutes = subjectSessions.reduce((total, session) => total + session.plannedMinutes, 0)
  const dailySubjectMinutes = subjectCount > 0 ? Math.max(1, Math.round(dailyStudyMinutes / subjectCount)) : 0
  const taskPlannedMinutes = Math.max(dailySubjectMinutes, subjectTasks.length * dailySubjectMinutes)
  const plannedMinutes = Math.max(sessionPlannedMinutes + taskPlannedMinutes, dailySubjectMinutes)

  const readiness = plannedMinutes > 0 ? Math.min(100, Math.round((studiedMinutes / plannedMinutes) * 100)) : 0

  return {
    readiness,
    studiedMinutes,
    sessions: subjectSessions.length,
    completedTasks: subjectTasks.length,
  }
}

function getRecommendedSubject(subjectReadiness: { subject: string; readiness: number; studiedMinutes: number }[], activeTitle?: string) {
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

export default function ExamsPage({ onNavigate }: ExamsPageProps) {
  const { activeSession, elapsedSeconds, endSession, metrics, pauseSession, resumeSession, sessions, startSession } = useStudy()
  const setupPreferences = useSetupPreferences()
  const completedTasks = useMemo(() => loadCompletedTasks(), [])
  const subjects = useMemo(() => parseSetupSubjects(setupPreferences.subjects, []), [setupPreferences.subjects])
  const dailyStudyMinutes =
    typeof setupPreferences.dailyStudyMinutes === 'number' && Number.isFinite(setupPreferences.dailyStudyMinutes)
      ? Math.max(0, setupPreferences.dailyStudyMinutes)
      : 90
  const availableDays = Object.values(setupPreferences.weeklyAvailability).filter(Boolean).length
  const hasExamConfigured = Boolean(setupPreferences.examDate)
  const countdown = useMemo(() => formatCountdown(setupPreferences.examDate), [setupPreferences.examDate])
  const weekStart = getWeekStart(new Date())
  const weekEnd = getWeekEnd(new Date())
  const completedMinutesThisWeek = completedTasks
    .filter((task) => {
      const completedAt = new Date(task.completedAt)

      return completedAt >= weekStart && completedAt < weekEnd
    })
    .reduce((total, task) => total + task.durationMinutes, 0)
  const totalPlannedMinutesThisWeek = dailyStudyMinutes * availableDays
  const weeklyCompletionPercentage =
    totalPlannedMinutesThisWeek > 0 ? Math.min(100, Math.round((completedMinutesThisWeek / totalPlannedMinutesThisWeek) * 100)) : 0
  const subjectReadiness = subjects.map((subject) => ({
    subject,
    ...getSubjectReadiness(subject, sessions, completedTasks, dailyStudyMinutes, subjects.length),
  }))
  const recommendedSubject = getRecommendedSubject(subjectReadiness, activeSession?.title)
  const averageSubjectReadiness =
    subjectReadiness.length > 0
      ? Math.round(subjectReadiness.reduce((total, subject) => total + subject.readiness, 0) / subjectReadiness.length)
      : metrics.readinessPercentage
  const examConfidence = Math.round((averageSubjectReadiness + metrics.readinessPercentage + weeklyCompletionPercentage) / 3)
  const confidenceLabel = examConfidence >= 75 ? 'Strong' : examConfidence >= 45 ? 'Building' : 'Needs focus'
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
      plannedMinutes: Number.parseInt(recommendedSubject.minutes, 10) || 25,
    })
  }

  const activeMinutes = Math.floor(elapsedSeconds / 60)
  const activeSeconds = elapsedSeconds % 60
  const activeElapsedDisplay = `${activeMinutes}:${String(activeSeconds).padStart(2, '0')}`

  return (
    <div className="min-h-screen bg-background pb-40 transition-colors duration-500">
      <header className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:pt-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')} className="gap-2">
            <ArrowLeft size={16} />
            Back to dashboard
          </Button>
          <ThemeToggle />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-purple">Exams</p>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Know what needs revision before exam day.
            </h1>
            <p className="mt-5 text-base leading-7 text-muted sm:text-lg">
              StudySpark turns your study history into countdown pressure, subject readiness, revision priorities, and confidence.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Exam confidence</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-5xl font-black tracking-tight text-foreground">{examConfidence}%</p>
                <p className="mt-1 text-sm font-semibold text-muted">{confidenceLabel}</p>
              </div>
              <Trophy size={32} className="mb-2 text-purple" />
            </div>
            <div className="mt-5 h-2 w-full overflow-hidden rounded-full border border-purple/15 bg-muted/10">
              <div className="h-full rounded-full bg-purple progress-transition" style={{ width: `${examConfidence}%` }} />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-10 max-w-7xl space-y-6 px-4 sm:px-6">
        {!hasExamConfigured && (
          <section className="rounded-2xl border border-dashed border-border bg-card/70 p-8 shadow-sm">
            <div className="grid gap-5 sm:grid-cols-[auto_1fr_auto] sm:items-center">
              <div className="grid size-14 place-items-center rounded-2xl border border-border bg-background text-muted">
                <CalendarClock size={28} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-foreground">Set an exam date to unlock the story</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                  Add an exam date and subjects in setup to calculate days remaining, readiness, priorities, and recommendations.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onNavigate('setup')}>
                Configure Exam
              </Button>
            </div>
          </section>
        )}

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div
            className={`rounded-2xl border bg-card p-6 shadow-sm ${
              countdown.urgency === 'high' ? 'border-teal/25' : 'border-border'
            }`}
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Days remaining</p>
                <h2 className="mt-4 text-6xl font-black tracking-tight text-foreground sm:text-7xl">{countdown.label}</h2>
                <p className="mt-4 text-base leading-7 text-muted">{countdown.helper}</p>
              </div>
              <div
                className={`grid size-12 shrink-0 place-items-center rounded-xl border ${
                  countdown.urgency === 'high' ? 'border-teal/25 bg-teal/10 text-teal' : 'border-purple/15 bg-purple/5 text-purple'
                }`}
              >
                <CalendarClock size={28} />
              </div>
            </div>
            <div className="mt-8 rounded-xl border border-border bg-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Exam date</p>
              <p className="mt-2 text-lg font-extrabold text-foreground">{formatExamDate(setupPreferences.examDate)}</p>
            </div>
            {!setupPreferences.examDate && (
              <Button variant="outline" size="sm" onClick={() => onNavigate('setup')} className="mt-5">
                Set Exam Date
              </Button>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple">Recommended subject</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">{recommendedSubject.subject}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{recommendedSubject.description}</p>
              </div>
              <div className="shrink-0 rounded-2xl border border-border bg-background/70 p-4 xl:w-48">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Revision block</p>
                <p className="mt-2 text-2xl font-black text-foreground">{recommendedSubject.minutes}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button onClick={handleStartRecommendedSubject} disabled={Boolean(activeSession)} className="gap-2">
                <BookOpen size={16} />
                {hasExamConfigured ? 'Start Recommended Review' : 'Configure Exam'}
              </Button>
              <Button variant="outline" onClick={() => onNavigate('setup')} className="gap-2">
                <Target size={16} />
                Adjust Exam Plan
              </Button>
            </div>

            {activeSession && (
              <div className="mt-5 rounded-2xl border border-purple/20 bg-purple/5 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">Active session</p>
                    <h3 className="mt-1 truncate text-lg font-extrabold text-foreground">{activeSession.title}</h3>
                    <p className="mt-1 text-sm font-semibold tabular-nums text-muted">
                      {activeElapsedDisplay} studied - {activeSession.status}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {activeSession.status === 'running' ? (
                      <Button variant="outline" size="sm" onClick={pauseSession} className="gap-2">
                        <Pause size={14} />
                        Pause
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={resumeSession} className="gap-2">
                        <Play size={14} />
                        Resume
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={endSession} className="gap-2">
                      <Square size={14} />
                      End
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple">Subject readiness</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">Readiness map</h2>
              </div>
              <p className="text-sm font-semibold text-muted">{averageSubjectReadiness}% average</p>
            </div>

            {subjectReadiness.length > 0 ? (
              <div className="space-y-3">
                {subjectReadiness.map((subject) => (
                  <article key={subject.subject} className="rounded-2xl border border-border bg-background/70 p-4">
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-extrabold text-foreground">{subject.subject}</h3>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                          {subject.studiedMinutes}m studied - {subject.sessions + subject.completedTasks} signal
                          {subject.sessions + subject.completedTasks === 1 ? '' : 's'}
                        </p>
                      </div>
                      <span className="text-2xl font-black text-foreground">{subject.readiness}%</span>
                    </div>
                    <ReadinessBar percentage={subject.readiness} label={`${subject.subject} readiness`} showTooltip={false} />
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-background/60 p-6">
                <h3 className="text-lg font-extrabold text-foreground">Add subjects to see readiness</h3>
                <p className="mt-2 text-sm leading-6 text-muted">StudySpark needs your exam subjects before it can compare readiness.</p>
                <Button variant="outline" size="sm" onClick={() => onNavigate('setup')} className="mt-4">
                  Add Subjects
                </Button>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple">Revision priorities</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">Weakest first</h2>
              {revisionPriorities.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {revisionPriorities.map((subject, index) => (
                    <div key={subject.subject} className="rounded-xl border border-border bg-background/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-purple text-xs font-black text-purple-foreground">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-extrabold text-foreground">{subject.subject}</p>
                            <p className="text-xs text-muted">{subject.studiedMinutes}m studied</p>
                          </div>
                        </div>
                        <span className="font-black text-foreground">{subject.readiness}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-sm leading-6 text-muted">Add subjects to generate revision priorities.</p>
              )}
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple">Exam confidence</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">{confidenceLabel}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Confidence blends subject readiness, overall study readiness, and this week&apos;s completion.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  { label: 'Subjects', value: `${averageSubjectReadiness}%` },
                  { label: 'Study', value: `${metrics.readinessPercentage}%` },
                  { label: 'Week', value: `${weeklyCompletionPercentage}%` },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-border bg-background/70 p-3">
                    <p className="text-lg font-black text-foreground">{item.value}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{item.label}</p>
                  </div>
                ))}
              </div>
            </section>

            {countdown.urgency === 'high' && (
              <section className="rounded-2xl border border-teal/25 bg-teal/10 p-5 text-teal shadow-sm">
                <div className="flex gap-3">
                  <AlertTriangle size={20} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-extrabold">Final stretch</p>
                    <p className="mt-1 text-sm leading-6">Keep sessions short and target the lowest-readiness subjects first.</p>
                  </div>
                </div>
              </section>
            )}
          </aside>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Weekly study signal</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">{weeklyCompletionPercentage}% complete</h2>
              <p className="text-sm font-semibold text-muted">
                {completedMinutesThisWeek}/{totalPlannedMinutesThisWeek}m
              </p>
            </div>
            <div className="mt-5 h-2 w-full overflow-hidden rounded-full border border-purple/15 bg-muted/10">
              <div className="h-full rounded-full bg-purple progress-transition" style={{ width: `${weeklyCompletionPercentage}%` }} />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Recent exam signal</p>
            {metrics.recentActivity.length > 0 ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {metrics.recentActivity.slice(0, 3).map((session) => (
                  <div key={session.id} className="rounded-xl border border-border bg-background/70 p-3">
                    <p className="truncate text-sm font-semibold text-foreground">{session.title}</p>
                    <p className="mt-1 text-xs text-muted">
                      {session.durationMinutes}m studied of {session.plannedMinutes}m planned
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-border bg-background/60 p-4">
                <p className="text-sm leading-6 text-muted">Start the recommended review to create your first exam signal.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
