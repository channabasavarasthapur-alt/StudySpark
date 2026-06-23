import { useMemo, useState } from 'react'
import type { View } from '../types/navigation'
import { BentoCard } from '../components/ui/BentoCard'
import { Button } from '../components/ui/Button'
import { ReadinessBar } from '../components/ui/ReadinessBar'
import { ThemeToggle } from '../components/ThemeToggle'
import { Zap, Plus, Trophy, Clock, BookOpen, CheckCircle2, CalendarClock, Trash2, Pause, Play, Square } from 'lucide-react'
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
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">StudySpark dashboard</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Today&apos;s study plan
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
              A focused view of what to study now, how you are progressing, and what to do next.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-7xl space-y-10 px-4 sm:px-6">
        <section role="region" aria-labelledby="dashboard-overview-heading" className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple">Overview</p>
            <h2 id="dashboard-overview-heading" className="mt-2 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              Dashboard overview
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <BentoCard
            className="border-purple/20"
            title={activeSession ? 'Continue active session' : 'Next best action'}
            description="The most useful next step is placed first so study starts with less decision fatigue."
            badge={activeSession ? activeSession.status : 'Recommended'}
          >
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-end">
              <div className="min-w-0">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted">
                  <Clock size={14} className="text-purple" />
                  {activeSession ? `${activeSource} - ${formatElapsed(elapsedSeconds)}` : 'Ready when you are'}
                </div>
                <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {hasSetupCompleted || activeSession ? nextActionTitle : 'Complete your study setup'}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
                  {hasSetupCompleted || activeSession
                    ? nextActionDescription
                    : 'Add subjects, an exam date, and a daily study target to generate your dashboard tasks.'}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                <Button
                  size="lg"
                  className="gap-2"
                  onClick={() => onNavigate(activeSession ? activeSessionView : hasSetupCompleted ? 'capsules' : 'setup')}
                >
                  <Zap size={18} fill="currentColor" />
                  {activeSession ? 'Open Session Context' : hasSetupCompleted ? 'Start Studying' : 'Open Setup'}
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

          <BentoCard
            className="border-purple/10"
            title="Progress summary"
            description="Completed sessions are the source of truth for dashboard progress."
          >
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { label: 'Minutes studied', value: metrics.totalStudyMinutes, helper: 'total focus time' },
                { label: 'Sessions', value: metrics.completedSessions, helper: 'completed' },
                { label: 'Streak', value: `${metrics.currentStreak}d`, helper: 'current run' },
                { label: 'Readiness', value: `${metrics.readinessPercentage}%`, helper: 'coverage estimate' },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-xl border border-border bg-background/70 p-4 text-left transition-colors duration-200"
                >
                  <p className="text-2xl font-extrabold tabular-nums text-foreground">{metric.value}</p>
                  <p className="mt-1 text-sm font-medium text-muted">{metric.label}</p>
                  <p className="mt-2 text-xs leading-5 text-muted">{metric.helper}</p>
                </div>
              ))}
            </div>
          </BentoCard>
          </div>
        </section>

        <section role="region" aria-labelledby="dashboard-study-heading" className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple">Focus flow</p>
            <h2 id="dashboard-study-heading" className="mt-2 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              Study plan, readiness, and recent activity
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <BentoCard
            className="border-purple/10"
            title="Today&apos;s study plan"
            description={`${formatDaysRemaining(daysRemaining)}. Daily study time is divided across your setup subjects.`}
            icon={<Trophy size={20} className="text-purple" />}
          >
            <div className="mt-6 h-[360px] space-y-3 overflow-y-auto pr-1">
              {!hasSetupCompleted ? (
                <div className="flex min-h-full items-center justify-center rounded-2xl border border-dashed border-border bg-background/60 p-6 text-center">
                  <div>
                    <div className="mx-auto grid size-12 place-items-center rounded-xl border border-border bg-card text-muted">
                      <CalendarClock size={24} />
                    </div>
                    <h3 className="mt-4 text-lg font-extrabold text-foreground">No setup completed</h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
                      Add your subjects, exam date, and daily study target to generate today&apos;s plan.
                    </p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => onNavigate('setup')}>
                      Complete Setup
                    </Button>
                  </div>
                </div>
              ) : todayTasks.length > 0 ? (
                todayTasks.map((task) => {
                  const isComplete = completedTaskIds.has(task.id)

                  return (
                    <div
                      key={task.id}
                      className={`group flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-border bg-background/70 p-4 transition-colors duration-200 sm:flex-row sm:items-center ${
                        isComplete ? 'opacity-75' : 'hover:border-purple/35 hover:bg-purple/5'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div
                          className={`grid size-11 shrink-0 place-items-center rounded-xl border ${
                            isComplete ? 'border-teal/20 bg-teal/10 text-teal' : 'border-purple/15 bg-purple/5 text-purple'
                          }`}
                        >
                          {isComplete ? <CheckCircle2 size={18} /> : <span className="text-xs font-bold">GO</span>}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-foreground">{task.title}</h3>
                          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted">
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
                        {isComplete ? 'Completed' : 'Complete'}
                        <CheckCircle2 size={14} />
                      </Button>
                    </div>
                  )
                })
              ) : (
                <div className="flex min-h-full items-center justify-center rounded-2xl border border-dashed border-border bg-background/60 p-6 text-center">
                  <div>
                    <div className="mx-auto grid size-12 place-items-center rounded-xl border border-border bg-card text-muted">
                      <Trophy size={24} />
                    </div>
                    <h3 className="mt-4 text-lg font-extrabold text-foreground">
                      {todayIsAvailable ? 'No tasks available' : 'No study blocks scheduled today'}
                    </h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
                      {todayIsAvailable
                        ? 'Your setup is valid, but there are no study blocks for today. Adjust your subjects or daily target to create tasks.'
                        : 'Today is marked unavailable in setup, so StudySpark is leaving the daily plan clear.'}
                    </p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => onNavigate('setup')}>
                      Adjust Setup
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </BentoCard>

          <div className="grid min-w-0 gap-6">
            <BentoCard
              className="border-purple/10"
              title="Weekly progress"
              description="Study plan completion from local dashboard tasks."
              icon={<CalendarClock size={20} className="text-purple" />}
            >
              <div className="mt-6 space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-muted">Completed this week</span>
                    <span className="font-extrabold text-foreground">{weeklyCompletionPercentage}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full border border-purple/15 bg-muted/10">
                    <div
                      className="h-full rounded-full bg-purple progress-transition"
                      style={{ width: `${weeklyCompletionPercentage}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-background/70 p-4">
                    <p className="text-2xl font-extrabold tabular-nums text-foreground">{totalPlannedMinutesThisWeek}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">Planned minutes</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background/70 p-4">
                    <p className="text-2xl font-extrabold tabular-nums text-foreground">{completedMinutesThisWeek}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">Completed minutes</p>
                  </div>
                </div>
              </div>
            </BentoCard>

            <BentoCard
              className="border-purple/10"
              title="Readiness explained"
              description="A transparent progress signal for students, teachers, and parents."
              icon={<BookOpen size={20} className="text-purple" />}
            >
              <div className="mt-6 space-y-4">
                <ReadinessBar percentage={metrics.readinessPercentage} />
                <p className="text-sm leading-6 text-muted">
                  Readiness increases when planned study time is completed. It is a guide for reflection, not a grade.
                </p>
                <ul className="space-y-2 text-sm leading-6 text-muted">
                  <li>Complete focused sessions.</li>
                  <li>Review recent capsules.</li>
                  <li>Keep study history consistent.</li>
                </ul>
              </div>
            </BentoCard>

            <BentoCard className="border-purple/10" title="Recent activity" description="Your latest completed sessions.">
              {hasActivity ? (
                <div className="mt-5 space-y-3">
                  {metrics.recentActivity.slice(0, 3).map((session) => (
                    <div
                      key={session.id}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-transparent p-3 transition-colors duration-200 hover:border-purple/30 hover:bg-purple/5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{session.title}</p>
                        <p className="truncate text-xs text-muted">{formatSessionDateTime(session.completedAt)}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="rounded-full bg-purple/10 px-2.5 py-1 text-xs font-semibold text-purple">
                          {session.durationMinutes}m
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSession(session.id)}
                          className="gap-2 text-muted"
                        >
                          <Trash2 size={14} />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-border bg-background/60 p-5 text-sm leading-6 text-muted">
                  Complete your first capsule session to build a reliable study history.
                  <Button variant="ghost" size="sm" className="mt-3 px-0 text-purple" onClick={() => onNavigate('capsules')}>
                    Create a capsule
                  </Button>
                </div>
              )}
            </BentoCard>
          </div>
          </div>
        </section>
      </main>
    </div>
  )
}
