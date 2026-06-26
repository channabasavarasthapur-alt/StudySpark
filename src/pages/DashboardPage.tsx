import { useMemo, useState } from 'react'
import type { View } from '../types/navigation'
import { BentoCard } from '../components/ui/BentoCard'
import { Button } from '../components/ui/Button'
import { ReadinessBar } from '../components/ui/ReadinessBar'
import { ThemeToggle } from '../components/ThemeToggle'
import { Zap, Plus, Trophy, BookOpen, CheckCircle2, CalendarClock, Trash2, Pause, Play, Square } from 'lucide-react'
import { useStudy, type StudySessionSource } from '../study/studyContext'
import { getLocalDateKey, getWeekdayId, parseSetupSubjects, useSetupPreferences } from '../study/setupPreferences'

interface DashboardPageProps {
  onNavigate: (view: View) => void
}

const sourceLabels: Record<StudySessionSource, string> = {
  capsule: 'Capsule study',
  mission: 'Mission',
  revision: 'Revision',
  'exam-prep': 'Exam prep',
  pomodoro: 'Focus timer',
}

interface StudyPlanTask {
  id: string
  title: string
  subject: string
  durationMinutes: number
  dateKey: string
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

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

function getDateKey(date: Date) {
  return getLocalDateKey(date)
}

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

function getDaysUntilExam(examDate?: string) {
  if (!examDate) {
    return null
  }

  const today = new Date()
  const targetDate = new Date(`${examDate}T00:00:00`)
  today.setHours(0, 0, 0, 0)

  return Math.ceil((targetDate.getTime() - today.getTime()) / 86400000)
}

function formatDaysRemaining(daysRemaining: number | null) {
  if (daysRemaining === null) {
    return 'Exam date not set'
  }

  if (daysRemaining < 0) {
    return 'Exam date passed'
  }

  if (daysRemaining === 0) {
    return 'Exam today'
  }

  return `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} until exam`
}

function generateTodayTasks(subjects: string[], dailyStudyMinutes: number): StudyPlanTask[] {
  const dateKey = getDateKey(new Date())
  const safeDailyMinutes = Math.max(0, Math.round(dailyStudyMinutes))

  if (safeDailyMinutes === 0 || subjects.length === 0) {
    return []
  }

  const baseMinutes = Math.floor(safeDailyMinutes / subjects.length)
  const extraMinutes = safeDailyMinutes % subjects.length

  return subjects.map((subject, index) => {
    const durationMinutes = baseMinutes + (index < extraMinutes ? 1 : 0)

    return {
      id: `${dateKey}-${subject.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      title: `${subject} study block`,
      subject,
      durationMinutes,
      dateKey,
    }
  }).filter((task) => task.durationMinutes > 0)
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

function formatSessionDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { activeSession, deleteSession, elapsedSeconds, endSession, metrics, pauseSession, resumeSession } = useStudy()
  const [completedTasks, setCompletedTasks] = useState<CompletedStudyPlanTask[]>(() => loadCompletedTasks())
  const setupPreferences = useSetupPreferences()
  const subjects = useMemo(() => parseSetupSubjects(setupPreferences.subjects, []), [setupPreferences.subjects])
  const dailyStudyMinutes =
    typeof setupPreferences.dailyStudyMinutes === 'number' && Number.isFinite(setupPreferences.dailyStudyMinutes)
      ? Math.max(0, setupPreferences.dailyStudyMinutes)
      : 90
  const today = new Date()
  const todayIsAvailable = setupPreferences.weeklyAvailability[getWeekdayId(today)]
  const availableDays = Object.values(setupPreferences.weeklyAvailability).filter(Boolean).length
  const hasSetupCompleted = subjects.length > 0 && Boolean(setupPreferences.examDate) && dailyStudyMinutes > 0
  const daysRemaining = getDaysUntilExam(setupPreferences.examDate)
  const todayTasks = useMemo(
    () => (hasSetupCompleted && todayIsAvailable ? generateTodayTasks(subjects, dailyStudyMinutes) : []),
    [dailyStudyMinutes, hasSetupCompleted, subjects, todayIsAvailable],
  )
  const completedTaskIds = new Set(completedTasks.map((task) => task.id))
  const incompleteTask = todayTasks.find((task) => !completedTaskIds.has(task.id))
  const weekStart = getWeekStart(new Date())
  const weekEnd = getWeekEnd(new Date())
  const completedMinutesThisWeek = completedTasks
    .filter((task) => {
      const completedAt = new Date(task.completedAt)

      return completedAt >= weekStart && completedAt < weekEnd
    })
    .reduce((total, task) => total + task.durationMinutes, 0)
  const totalPlannedMinutesThisWeek = hasSetupCompleted ? dailyStudyMinutes * availableDays : 0
  const weeklyCompletionPercentage =
    totalPlannedMinutesThisWeek > 0 ? Math.min(100, Math.round((completedMinutesThisWeek / totalPlannedMinutesThisWeek) * 100)) : 0
  const hasActivity = metrics.recentActivity.length > 0
  const activeSource = activeSession ? sourceLabels[activeSession.source] : null
  const activeSessionView = activeSession?.source === 'capsule' ? 'capsules' : activeSession?.source === 'exam-prep' ? 'exams' : 'dashboard'
  const nextActionTitle = activeSession ? activeSession.title : incompleteTask?.title ?? 'Study plan complete'
  const nextActionDescription = activeSession
    ? `${activeSource} is ${activeSession.status}. ${formatElapsed(elapsedSeconds)} studied so far.`
    : incompleteTask
      ? `${incompleteTask.durationMinutes} minutes planned for ${incompleteTask.subject}. ${formatDaysRemaining(daysRemaining)}.`
      : 'All generated study tasks for today are complete.'
  const completedTodayCount = todayTasks.filter((task) => completedTaskIds.has(task.id)).length
  const todayCompletionPercentage = todayTasks.length > 0 ? Math.round((completedTodayCount / todayTasks.length) * 100) : 0
  const primaryActionView = activeSession ? activeSessionView : hasSetupCompleted ? 'capsules' : 'setup'
  const primaryActionLabel = activeSession ? 'Open Session Context' : hasSetupCompleted ? 'Start Next Study Block' : 'Complete Setup'

  const completeTask = (task: StudyPlanTask) => {
    setCompletedTasks((currentTasks) => {
      if (currentTasks.some((currentTask) => currentTask.id === task.id)) {
        return currentTasks
      }

      const nextTasks = [
        {
          id: task.id,
          title: task.title,
          subject: task.subject,
          durationMinutes: task.durationMinutes,
          completedAt: new Date().toISOString(),
          dateKey: task.dateKey,
        },
        ...currentTasks,
      ]

      localStorage.setItem(completedTasksStorageKey, JSON.stringify(nextTasks))

      return nextTasks
    })
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background pb-24 transition-colors duration-500">
      <header className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:pt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-purple">StudySpark dashboard</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              What should I do right now?
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
              Start with the next useful action. Progress, readiness, and history stay close by without competing for attention.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-7xl space-y-8 px-4 sm:px-6">
        <section role="region" aria-labelledby="dashboard-action-heading" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <BentoCard className="border-purple/25 p-5 sm:p-7" badge={activeSession ? activeSession.status : 'Recommended'}>
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-end">
              <div className="min-w-0">
                <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-purple/15 bg-purple/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-purple">
                  <Zap size={15} fill="currentColor" />
                  {activeSession ? `${activeSource} in progress` : 'Next best action'}
                </div>
                <h2 id="dashboard-action-heading" className="max-w-3xl text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {hasSetupCompleted || activeSession ? nextActionTitle : 'Complete your study setup'}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
                  {hasSetupCompleted || activeSession
                    ? nextActionDescription
                    : 'Add your subjects, exam date, and daily target. StudySpark will turn that into a practical plan for today.'}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-border bg-background/70 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Today</p>
                    <p className="mt-2 text-2xl font-black tabular-nums text-foreground">
                      {hasSetupCompleted ? `${completedTodayCount}/${todayTasks.length}` : '--'}
                    </p>
                    <p className="mt-1 text-sm text-muted">blocks done</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/70 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Exam</p>
                    <p className="mt-2 text-lg font-extrabold text-foreground">{formatDaysRemaining(daysRemaining)}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/70 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Session</p>
                    <p className="mt-2 text-2xl font-black tabular-nums text-foreground">
                      {activeSession ? formatElapsed(elapsedSeconds) : `${dailyStudyMinutes}m`}
                    </p>
                    <p className="mt-1 text-sm text-muted">{activeSession ? activeSession.status : 'daily target'}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button size="lg" className="gap-2" onClick={() => onNavigate(primaryActionView)}>
                  <Zap size={18} fill="currentColor" />
                  {primaryActionLabel}
                </Button>
                {activeSession && (
                  <div className="grid grid-cols-2 gap-3">
                    {activeSession.status === 'running' ? (
                      <Button variant="outline" size="lg" className="gap-2" onClick={pauseSession}>
                        <Pause size={18} />
                        Pause
                      </Button>
                    ) : (
                      <Button variant="outline" size="lg" className="gap-2" onClick={resumeSession}>
                        <Play size={18} />
                        Resume
                      </Button>
                    )}
                    <Button variant="outline" size="lg" className="gap-2" onClick={endSession}>
                      <Square size={18} />
                      End
                    </Button>
                  </div>
                )}
                <Button variant="outline" size="lg" className="gap-2" onClick={() => onNavigate('capsules')}>
                  <Plus size={18} />
                  New Capsule
                </Button>
              </div>
            </div>
          </BentoCard>

          <aside className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Progress</p>
                <h2 className="mt-2 text-xl font-extrabold text-foreground">Quiet signals</h2>
              </div>
              <Trophy size={22} className="text-purple" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { label: 'Minutes', value: metrics.totalStudyMinutes },
                { label: 'Sessions', value: metrics.completedSessions },
                { label: 'Streak', value: `${metrics.currentStreak}d` },
                { label: 'Ready', value: `${metrics.readinessPercentage}%` },
              ].map((metric) => (
                <div key={metric.label} className="rounded-lg border border-border bg-background/70 p-3">
                  <p className="text-xl font-black tabular-nums text-foreground">{metric.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">{metric.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <ReadinessBar percentage={metrics.readinessPercentage} showTooltip={false} />
              <p className="mt-3 text-sm leading-6 text-muted">Readiness rises as planned study gets completed.</p>
            </div>
          </aside>
        </section>

        <section role="region" aria-labelledby="dashboard-plan-heading" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          <h2 id="dashboard-plan-heading" className="sr-only">
            Study plan, readiness, and recent activity
          </h2>
          <BentoCard
            className="border-purple/10"
            title="Today's study plan"
            description={`${formatDaysRemaining(daysRemaining)}. Finish one block at a time.`}
            icon={<BookOpen size={20} className="text-purple" />}
          >
            <div className="mt-6">
              {hasSetupCompleted && todayTasks.length > 0 && (
                <div className="mb-5 rounded-lg border border-border bg-background/70 p-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-muted">Today&apos;s plan</span>
                    <span className="font-extrabold text-foreground">{todayCompletionPercentage}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full border border-purple/15 bg-muted/10">
                    <div className="h-full rounded-full bg-purple progress-transition" style={{ width: `${todayCompletionPercentage}%` }} />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {!hasSetupCompleted ? (
                  <div className="rounded-2xl border border-dashed border-border bg-background/60 p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex gap-4">
                        <div className="grid size-12 shrink-0 place-items-center rounded-xl border border-border bg-card text-purple">
                          <CalendarClock size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-extrabold text-foreground">Set up your first plan</h3>
                          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                            Tell StudySpark your subjects, exam date, and available time so this space becomes a real study queue.
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="shrink-0" onClick={() => onNavigate('setup')}>
                        Complete Setup
                      </Button>
                    </div>
                  </div>
                ) : todayTasks.length > 0 ? (
                  todayTasks.map((task) => {
                    const isComplete = completedTaskIds.has(task.id)
                    const isNext = task.id === incompleteTask?.id

                    return (
                      <div
                        key={task.id}
                        className={`flex flex-col items-stretch justify-between gap-4 rounded-2xl border p-4 transition-colors duration-200 sm:flex-row sm:items-center ${
                          isNext
                            ? 'border-purple/35 bg-purple/5'
                            : isComplete
                              ? 'border-border bg-background/60 opacity-75'
                              : 'border-border bg-background/70 hover:border-purple/25'
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <div
                            className={`grid size-11 shrink-0 place-items-center rounded-xl border ${
                              isComplete ? 'border-teal/20 bg-teal/10 text-teal' : 'border-purple/15 bg-purple/5 text-purple'
                            }`}
                          >
                            {isComplete ? <CheckCircle2 size={18} /> : isNext ? <Zap size={17} fill="currentColor" /> : <BookOpen size={17} />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-foreground">{task.title}</h3>
                              {isNext && (
                                <span className="rounded-full bg-purple px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-foreground">
                                  Next
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                              {task.subject} - {task.durationMinutes}m
                            </p>
                          </div>
                        </div>
                        <Button
                          variant={isComplete ? 'ghost' : 'outline'}
                          size="sm"
                          className="shrink-0 self-start gap-2 sm:self-auto"
                          onClick={() => completeTask(task)}
                          disabled={isComplete}
                        >
                          {isComplete ? 'Completed' : 'Mark Done'}
                          <CheckCircle2 size={14} />
                        </Button>
                      </div>
                    )
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-border bg-background/60 p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex gap-4">
                        <div className="grid size-12 shrink-0 place-items-center rounded-xl border border-border bg-card text-teal">
                          <Trophy size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-extrabold text-foreground">
                            {todayIsAvailable ? 'Your plan needs a small adjustment' : 'Today is a rest day'}
                          </h3>
                          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                            {todayIsAvailable
                              ? 'Your setup is valid, but no blocks were generated for today. Adjust subjects or daily minutes to create tasks.'
                              : 'No study blocks are scheduled today. You can keep the plan clear or adjust availability in setup.'}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="shrink-0" onClick={() => onNavigate('setup')}>
                        Adjust Setup
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </BentoCard>

          <div className="grid min-w-0 gap-6">
            <BentoCard
              className="border-purple/10"
              title="Weekly progress"
              description="A quick check after you know what to do next."
              icon={<CalendarClock size={20} className="text-purple" />}
            >
              <div className="mt-6 space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-muted">Completed this week</span>
                    <span className="font-extrabold text-foreground">{weeklyCompletionPercentage}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full border border-purple/15 bg-muted/10">
                    <div className="h-full rounded-full bg-purple progress-transition" style={{ width: `${weeklyCompletionPercentage}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border bg-background/70 p-4">
                    <p className="text-2xl font-extrabold tabular-nums text-foreground">{completedMinutesThisWeek}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">Done</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/70 p-4">
                    <p className="text-2xl font-extrabold tabular-nums text-foreground">{totalPlannedMinutesThisWeek}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">Planned</p>
                  </div>
                </div>
              </div>
            </BentoCard>

            <BentoCard
              className="border-purple/10"
              title="Readiness explained"
              description="A guide for reflection, not a grade."
              icon={<BookOpen size={20} className="text-purple" />}
            >
              <div className="mt-6 space-y-4">
                <ReadinessBar percentage={metrics.readinessPercentage} />
                <p className="text-sm leading-6 text-muted">
                  Keep completing focused sessions, reviewing capsules, and building a consistent study history.
                </p>
              </div>
            </BentoCard>

            <BentoCard className="border-purple/10" title="Recent activity" description="Completed sessions stay available here.">
              {hasActivity ? (
                <div className="mt-5 space-y-3">
                  {metrics.recentActivity.slice(0, 3).map((session) => (
                    <div
                      key={session.id}
                      className="flex w-full flex-col gap-3 rounded-xl border border-transparent p-3 transition-colors duration-200 hover:border-purple/30 hover:bg-purple/5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{session.title}</p>
                        <p className="truncate text-xs text-muted">{formatSessionDateTime(session.completedAt)}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="rounded-full bg-purple/10 px-2.5 py-1 text-xs font-semibold text-purple">
                          {session.durationMinutes}m
                        </span>
                        <Button variant="danger" size="sm" onClick={() => deleteSession(session.id)} className="gap-2">
                          <Trash2 size={14} />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-border bg-background/60 p-5">
                  <h3 className="text-sm font-extrabold text-foreground">Build your first study history entry</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Start a capsule session when you are ready. Completed sessions will appear here for review.
                  </p>
                  <Button variant="ghost" size="sm" className="mt-3 px-0 text-purple" onClick={() => onNavigate('capsules')}>
                    Create a capsule
                  </Button>
                </div>
              )}
            </BentoCard>
          </div>
        </section>
      </main>
    </div>
  )
}
