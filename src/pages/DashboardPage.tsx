import { useMemo } from 'react'
import type { View } from '../types/navigation'
import { Button } from '../components/ui/Button'
import { ReadinessBar } from '../components/ui/ReadinessBar'
import { ThemeToggle } from '../components/ThemeToggle'
import {
  Zap,
  Plus,
  Trophy,
  CheckCircle2,
  CalendarClock,
  Trash2,
  Pause,
  Play,
  Square,
  ChevronDown,
} from 'lucide-react'
import { useStudy, useStudyTimer, type StudySession, type StudySessionSource, type CompletedStudyPlanTask } from '../study/studyContext'
import {
  getLocalDateKey,
  getWeekdayId,
  parseSetupSubjects,
  useSetupPreferences,
} from '../study/setupPreferences'

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

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

function getDateKey(date: Date) {
  return getLocalDateKey(date)
}

function getDaysUntilExam(examDate?: string) {
  if (!examDate) {
    return null
  }

  const today = new Date()
  const targetDate = new Date(`${examDate}T00:00:00`)
  today.setHours(0, 0, 0, 0)

  const diffTime = targetDate.getTime() - today.getTime()
  if (Number.isNaN(diffTime)) {
    return null
  }

  return Math.ceil(diffTime / 86400000)
}

function formatDaysRemaining(daysRemaining: number | null) {
  if (daysRemaining === null || Number.isNaN(daysRemaining)) {
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

function generateTodayTasks(
  subjects: string[],
  dailyStudyMinutes: number,
): StudyPlanTask[] {
  const dateKey = getDateKey(new Date())
  const safeDailyMinutes = Math.max(0, Math.round(dailyStudyMinutes))

  if (safeDailyMinutes === 0 || subjects.length === 0) {
    return []
  }

  const baseMinutes = Math.floor(safeDailyMinutes / subjects.length)
  const extraMinutes = safeDailyMinutes % subjects.length

  return subjects
    .map((subject, index) => {
      const durationMinutes = baseMinutes + (index < extraMinutes ? 1 : 0)

      return {
        id: `${dateKey}-${subject.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        title: `${subject} study block`,
        subject,
        durationMinutes,
        dateKey,
      }
    })
    .filter((task) => task.durationMinutes > 0)
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
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
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

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const {
    activeSession,
    deleteSession,
    endSession,
    metrics,
    pauseSession,
    resumeSession,
    sessions,
    completedTasks,
    completeTask,
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
  const today = new Date()
  const todayIsAvailable =
    setupPreferences.weeklyAvailability[getWeekdayId(today)]
  const availableDays = Object.values(
    setupPreferences.weeklyAvailability,
  ).filter(Boolean).length
  const hasSetupCompleted =
    subjects.length > 0 &&
    Boolean(setupPreferences.examDate) &&
    dailyStudyMinutes > 0
  const daysRemaining = getDaysUntilExam(setupPreferences.examDate)
  const todayTasks = useMemo(
    () =>
      hasSetupCompleted && todayIsAvailable
        ? generateTodayTasks(subjects, dailyStudyMinutes)
        : [],
    [dailyStudyMinutes, hasSetupCompleted, subjects, todayIsAvailable],
  )
  const completedTaskIds = new Set(completedTasks.map((task) => task.id))
  const incompleteTask = todayTasks.find((task) => !completedTaskIds.has(task.id))
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
  const totalPlannedMinutesThisWeek = hasSetupCompleted
    ? dailyStudyMinutes * availableDays
    : 0
  const weeklyCompletionPercentage =
    totalPlannedMinutesThisWeek > 0
      ? Math.min(
          100,
          Math.round((completedMinutesThisWeek / totalPlannedMinutesThisWeek) * 100),
        )
      : 0
  const hasActivity = metrics.recentActivity.length > 0
  const activeSource = activeSession ? sourceLabels[activeSession.source] : null
  const activeSessionView =
    activeSession?.source === 'capsule'
      ? 'capsules'
      : activeSession?.source === 'exam-prep'
        ? 'exams'
        : 'dashboard'
  const nextActionTitle = activeSession
    ? activeSession.title
    : incompleteTask?.title ?? 'Study plan complete'
  const nextActionDescription = activeSession
    ? `${activeSource} is ${activeSession.status}. ${formatElapsed(elapsedSeconds)} studied so far.`
    : incompleteTask
      ? `${incompleteTask.durationMinutes} minutes planned for ${incompleteTask.subject}. ${formatDaysRemaining(daysRemaining)}.`
      : 'All generated study tasks for today are complete.'
  const completedTodayCount = todayTasks.filter((task) =>
    completedTaskIds.has(task.id),
  ).length
  const todayCompletionPercentage =
    todayTasks.length > 0
      ? Math.round((completedTodayCount / todayTasks.length) * 100)
      : 0
  const primaryActionView = activeSession
    ? activeSessionView
    : hasSetupCompleted
      ? 'capsules'
      : 'setup'
  const primaryActionLabel = activeSession
    ? 'Open Session Context'
    : hasSetupCompleted
      ? 'Start Next Study Block'
      : 'Complete Setup'



  return (
    <div className="min-h-screen overflow-x-hidden bg-background pb-[calc(8rem+env(safe-area-inset-bottom))] transition-colors duration-500 sm:pb-[calc(6rem+env(safe-area-inset-bottom))]">
      {/* Header */}
      <header className="mx-auto max-w-2xl px-5 pt-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple">
              Your Daily Compass
            </p>
            <h1 className="mt-1.5 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              What should I do right now?
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Focus Area (Hero Action) */}
      <main className="mx-auto mt-6 max-w-2xl px-5 space-y-6">
        <section
          role="region"
          aria-labelledby="dashboard-action-heading"
          className="relative overflow-hidden rounded-2xl border border-purple/20 bg-gradient-to-br from-card to-background p-6 shadow-sm sm:p-8"
        >
          {/* Decorative background glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 size-48 rounded-full bg-purple/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 size-48 rounded-full bg-teal/5 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center text-center">
            {activeSession ? (
              // Active Session State
              <div className="w-full space-y-5">
                <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-purple/20 bg-purple/5 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-purple">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple opacity-75"></span>
                    <span className="relative inline-flex size-2 rounded-full bg-purple"></span>
                  </span>
                  {activeSource} in progress
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-5xl font-black tracking-tight tabular-nums text-purple sm:text-6xl">
                    {formatElapsed(elapsedSeconds)}
                  </span>
                  <h2
                    id="dashboard-action-heading"
                    className="mt-3 text-lg font-bold text-foreground sm:text-xl"
                  >
                    {nextActionTitle}
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    Session state: {activeSession.status === 'running' ? 'In progress' : 'Paused'}
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                  {activeSession.status === 'running' ? (
                    <Button
                      variant="outline"
                      size="md"
                      className="gap-2 w-full sm:w-auto"
                      onClick={pauseSession}
                    >
                      <Pause size={15} />
                      Pause Session
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="md"
                      className="gap-2 w-full sm:w-auto"
                      onClick={resumeSession}
                    >
                      <Play size={15} />
                      Resume Session
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="md"
                    className="gap-2 w-full sm:w-auto border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500"
                    onClick={endSession}
                  >
                    <Square size={15} />
                    End Session
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    className="gap-2 w-full sm:w-auto"
                    onClick={() => onNavigate(primaryActionView)}
                  >
                    <Zap size={15} />
                    Open Context
                  </Button>
                </div>
              </div>
            ) : hasSetupCompleted ? (
              // Recommended / Next Action State
              <div className="w-full space-y-5">
                <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-purple/10 bg-purple/5 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-purple">
                  <Zap size={10} fill="currentColor" />
                  Recommended Action
                </div>


                <div className="space-y-2">
                  <h2
                    id="dashboard-action-heading"
                    className="text-2xl font-black tracking-tight text-foreground sm:text-3xl"
                  >
                    {incompleteTask ? incompleteTask.subject : 'All caught up!'}
                  </h2>
                  <p className="mx-auto max-w-md text-sm leading-relaxed text-muted">
                    {nextActionDescription}
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                  {incompleteTask ? (
                    <>
                      <Button
                        size="lg"
                        className="w-full sm:w-auto gap-2 min-h-12 text-sm shadow-md"
                        onClick={() => onNavigate(primaryActionView)}
                      >
                        <Play size={15} fill="currentColor" />
                        {primaryActionLabel}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto gap-2 min-h-12 text-sm"
                        onClick={() => completeTask(incompleteTask)}
                      >
                        <CheckCircle2 size={15} />
                        Mark Done
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="lg"
                      className="w-full sm:w-auto gap-2 min-h-12 text-sm"
                      onClick={() => onNavigate('capsules')}
                    >
                      <Plus size={15} />
                      Generate Study Capsule
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              // Onboarding State
              <div className="w-full space-y-4">
                <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-purple/15 bg-purple/5 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-purple">
                  Setup Required
                </div>
                <div className="space-y-1">
                  <h2
                    id="dashboard-action-heading"
                    className="text-xl font-black text-foreground"
                  >
                    Create your study plan
                  </h2>
                  <p className="mx-auto max-w-sm text-sm text-muted">
                    Define your subjects and schedule to start generating daily study blocks.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto"
                    onClick={() => onNavigate('setup')}
                  >
                    Complete Setup
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Today's Study Plan list */}
        {hasSetupCompleted && todayTasks.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted">
                Today&apos;s Plan
              </h3>
              <span className="text-[11px] font-bold text-muted">
                {completedTodayCount} of {todayTasks.length} blocks done
              </span>
            </div>

            {/* Micro progress indicator */}
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted/10">
              <div
                className="h-full rounded-full bg-purple transition-[width] duration-500 ease-out"
                style={{ width: `${todayCompletionPercentage}%` }}
              />
            </div>

            <div className="space-y-2.5">
              {todayTasks.map((task) => {
                const isComplete = completedTaskIds.has(task.id)
                const isNext = task.id === incompleteTask?.id

                return (
                  <div
                    key={task.id}
                    className={`group flex items-center justify-between gap-4 rounded-xl border p-4 transition-all duration-200 ${
                      isComplete
                        ? 'border-border bg-card/40 opacity-60'
                        : isNext
                          ? 'border-purple/30 bg-purple/5 shadow-sm'
                          : 'border-border/60 bg-card hover:border-purple/20'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Interactive checkbox */}
                      <button
                        type="button"
                        onClick={() => !isComplete && completeTask(task)}
                        disabled={isComplete}
                        className="flex items-center justify-center -m-2 p-2 min-h-[44px] min-w-[44px] touch-manipulation cursor-pointer"
                        aria-label={
                          isComplete ? 'Task completed' : `Mark ${task.title} as done`
                        }
                      >
                        <div className={`flex size-6 shrink-0 items-center justify-center rounded-lg border transition-all ${
                          isComplete
                            ? 'border-teal/30 bg-teal/10 text-teal'
                            : isNext
                              ? 'border-purple/40 bg-purple/5 text-purple hover:bg-purple/10'
                              : 'border-border group-hover:border-purple'
                        }`}>
                          {isComplete ? (
                            <CheckCircle2 size={13} strokeWidth={3} />
                          ) : (
                            <div className="size-1.5 rounded-full bg-transparent group-hover:bg-purple" />
                          )}
                        </div>
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-semibold truncate ${
                              isComplete ? 'line-through text-muted' : 'text-foreground'
                            }`}
                          >
                            {task.subject}
                          </span>
                          {isNext && (
                            <span className="rounded-full bg-purple/10 px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-purple">
                              Next
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted">
                          {task.durationMinutes}m block
                        </p>
                      </div>
                    </div>

                    {!isComplete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100 transition-opacity min-h-8 px-2.5 text-xs text-purple"
                        onClick={() => completeTask(task)}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* On Rest Day / Rest Block state details */}
        {hasSetupCompleted && todayTasks.length === 0 && (
          <section className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center">
            <Trophy size={28} className="mx-auto text-teal" />
            <h3 className="mt-3 text-base font-extrabold text-foreground">
              {todayIsAvailable ? 'Plan Adjustment Needed' : 'Today is a rest day'}
            </h3>
            <p className="mt-1.5 text-sm text-muted">
              {todayIsAvailable
                ? 'Your preferences are set, but no blocks were generated for today. Adjust subjects or study time.'
                : 'No study tasks scheduled for today. Enjoy your rest, or adjust weekly availability in setup.'}
            </p>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('setup')}
              >
                Adjust Schedule Setup
              </Button>
            </div>
          </section>
        )}

        {/* Progress & History Section (Deemphasized details accordion) */}
        <section className="pt-2">
          <details className="group rounded-2xl border border-border bg-card p-4 transition-all">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 min-h-[44px]">
              <div className="flex items-center gap-2.5">
                <CalendarClock size={16} className="text-purple" />
                <span className="text-xs font-bold uppercase tracking-widest text-muted">
                  Insights & Progress History
                </span>
              </div>
              <ChevronDown
                size={16}
                className="shrink-0 text-muted transition-transform group-open:rotate-180"
              />
            </summary>

            <div className="mt-5 space-y-6 border-t border-border/60 pt-5">
              {/* Core metrics summary */}
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
                {[
                  { label: 'Weekly Done', value: `${completedMinutesThisWeek}m` },
                  { label: 'Streak', value: `${metrics.currentStreak}d` },
                  { label: 'Total Done', value: `${metrics.totalStudyMinutes}m` },
                  { label: 'Sessions', value: metrics.completedSessions },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-border bg-background/50 p-3.5 text-center"
                  >
                    <p className="text-lg font-black tabular-nums text-foreground">
                      {metric.value}
                    </p>
                    <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Weekly targets */}
              {hasSetupCompleted && (
                <div className="rounded-xl border border-border bg-background/30 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-muted">WEEKLY COMPLETION</span>
                    <span className="text-foreground">{weeklyCompletionPercentage}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/10">
                    <div
                      className="h-full rounded-full bg-purple"
                      style={{ width: `${weeklyCompletionPercentage}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted">
                    Completed {completedMinutesThisWeek}m of {totalPlannedMinutesThisWeek}m weekly target
                  </p>
                </div>
              )}

              {/* Readiness bar */}
              <div className="rounded-xl border border-border bg-background/30 p-4 space-y-3.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-purple">EXAM READINESS</span>
                  <span className="text-purple">{metrics.readinessPercentage}%</span>
                </div>
                <ReadinessBar
                  percentage={metrics.readinessPercentage}
                  showTooltip={false}
                />
                <p className="text-[11px] leading-relaxed text-muted">
                  Your current readiness index. Complete study plan blocks to increase your exam confidence.
                </p>
              </div>

              {/* Recent activity log */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted">
                  Recent Activity Log
                </h4>
                {hasActivity ? (
                  <div className="space-y-2">
                    {metrics.recentActivity.slice(0, 3).map((session) => (
                      <div
                        key={session.id}
                        className="flex flex-col gap-3 rounded-xl border border-border/80 bg-background/40 p-3.5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {session.title}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-muted">
                            {formatSessionDateTime(session.completedAt)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="rounded-full bg-purple/10 px-2.5 py-1 text-xs font-semibold text-purple">
                            {session.durationMinutes}m
                          </span>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                        if (window.confirm('Delete this session?')) {
                          deleteSession(session.id)
                        }
                      }}
                            className="min-h-[44px] gap-1.5 border-red-500/10 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-xs px-2.5"
                          >
                            <Trash2 size={13} />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed text-muted">
                    Completed study blocks will appear here after you finish your first session.
                  </p>
                )}
              </div>
            </div>
          </details>
        </section>
      </main>
    </div>
  )
}
