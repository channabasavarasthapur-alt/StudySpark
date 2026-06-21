import { useMemo } from 'react'
import { ArrowLeft, BookOpen, CalendarClock, CheckCircle2, Clock, Flame, Target, Trophy } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { ReadinessBar } from '../components/ui/ReadinessBar'
import { ThemeToggle } from '../components/ThemeToggle'
import type { View } from '../types/navigation'
import { useStudy, type StudySession } from '../study/studyContext'

interface ExamsPageProps {
  onNavigate: (view: View) => void
}

interface SetupPreferences {
  subjects?: string
  examDate?: string
  dailyStudyMinutes?: number
}

const setupStorageKey = 'studyspark.setupPreferences'
const fallbackSubjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology']

function loadSetupPreferences(): SetupPreferences {
  try {
    const storedValue = localStorage.getItem(setupStorageKey)

    return storedValue ? (JSON.parse(storedValue) as SetupPreferences) : {}
  } catch {
    return {}
  }
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

function getSubjects(setupSubjects?: string) {
  const parsedSubjects = setupSubjects
    ?.split(',')
    .map((subject) => subject.trim())
    .filter(Boolean)

  return parsedSubjects && parsedSubjects.length > 0 ? parsedSubjects : fallbackSubjects
}

function getSubjectReadiness(subject: string, sessions: StudySession[], fallbackReadiness: number) {
  const subjectSessions = sessions.filter((session) => session.title.toLowerCase().includes(subject.toLowerCase()))

  if (subjectSessions.length === 0) {
    return {
      readiness: fallbackReadiness,
      studiedMinutes: 0,
      sessions: 0,
    }
  }

  const plannedMinutes = subjectSessions.reduce((total, session) => total + session.plannedMinutes, 0)
  const studiedMinutes = subjectSessions.reduce((total, session) => total + session.durationMinutes, 0)
  const readiness = plannedMinutes > 0 ? Math.min(100, Math.round((studiedMinutes / plannedMinutes) * 100)) : 0

  return {
    readiness,
    studiedMinutes,
    sessions: subjectSessions.length,
  }
}

function getRecommendedTask(metrics: ReturnType<typeof useStudy>['metrics'], activeTitle?: string) {
  if (activeTitle) {
    return {
      title: activeTitle,
      description: 'Continue the active session before starting new exam prep.',
      minutes: 'In progress',
    }
  }

  if (metrics.completedSessions === 0) {
    return {
      title: 'Create your first study capsule',
      description: 'Start with one clear topic so readiness has real study data behind it.',
      minutes: '20m',
    }
  }

  if (metrics.toReview > 0) {
    return {
      title: 'Review unfinished study sessions',
      description: `${metrics.toReview} session${metrics.toReview === 1 ? '' : 's'} ended before the planned time.`,
      minutes: '15m',
    }
  }

  return {
    title: 'Exam prep mixed review',
    description: 'Run a short review across recent topics to keep recall fresh.',
    minutes: '25m',
  }
}

export default function ExamsPage({ onNavigate }: ExamsPageProps) {
  const { activeSession, metrics, sessions, startSession } = useStudy()
  const setupPreferences = useMemo(() => loadSetupPreferences(), [])
  const subjects = useMemo(() => getSubjects(setupPreferences.subjects), [setupPreferences.subjects])
  const countdown = useMemo(() => formatCountdown(setupPreferences.examDate), [setupPreferences.examDate])
  const recommendedTask = getRecommendedTask(metrics, activeSession?.title)
  const subjectReadiness = subjects.map((subject) => ({
    subject,
    ...getSubjectReadiness(subject, sessions, metrics.readinessPercentage),
  }))

  const handleStartRecommendedTask = () => {
    if (activeSession) {
      return
    }

    if (metrics.completedSessions === 0) {
      onNavigate('capsules')
      return
    }

    startSession({
      source: 'exam-prep',
      title: recommendedTask.title,
      plannedMinutes: Number.parseInt(recommendedTask.minutes, 10) || 25,
    })
  }

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

        <div className="mt-10 max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted">Exams</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Exam readiness at a glance.
          </h1>
          <p className="mt-5 text-base leading-7 text-muted sm:text-lg">
            Use completed study sessions to see readiness, countdown pressure, and the next useful task.
          </p>
        </div>
      </header>

      <main className="mx-auto mt-10 max-w-7xl space-y-6 px-4 sm:px-6">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-purple/15 bg-purple/5 text-purple">
                <Target size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple">Recommended next task</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">{recommendedTask.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{recommendedTask.description}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-border bg-background/70 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl border border-border bg-card text-purple">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">Suggested block</p>
                  <p className="text-lg font-extrabold text-foreground">{recommendedTask.minutes}</p>
                </div>
              </div>
              <Button onClick={handleStartRecommendedTask} disabled={Boolean(activeSession)} className="gap-2">
                <BookOpen size={16} />
                {metrics.completedSessions === 0 ? 'Create Capsule' : 'Start Task'}
              </Button>
            </div>
          </div>

          <aside className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <div
                className={`grid size-11 place-items-center rounded-xl border ${
                  countdown.urgency === 'high' ? 'border-teal/25 bg-teal/10 text-teal' : 'border-purple/15 bg-purple/5 text-purple'
                }`}
              >
                <CalendarClock size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Exam countdown</p>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground">{countdown.label}</h2>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-muted">{countdown.helper}</p>
            {!setupPreferences.examDate && (
              <Button variant="outline" size="sm" onClick={() => onNavigate('setup')} className="mt-5">
                Set Exam Date
              </Button>
            )}
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple">Subject readiness</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">Subjects</h2>
            </div>
            <div className="space-y-4">
              {subjectReadiness.map((subject) => (
                <article key={subject.subject} className="rounded-2xl border border-border bg-background/70 p-4">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-extrabold text-foreground">{subject.subject}</h3>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                        {subject.sessions} session{subject.sessions === 1 ? '' : 's'} - {subject.studiedMinutes}m studied
                      </p>
                    </div>
                    <span className="text-xl font-extrabold text-foreground">{subject.readiness}%</span>
                  </div>
                  <ReadinessBar percentage={subject.readiness} label={`${subject.subject} readiness`} showTooltip={false} />
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple">Progress summary</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">{metrics.readinessPercentage}% ready</h2>
              <div className="mt-5">
                <ReadinessBar percentage={metrics.readinessPercentage} />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { label: 'Minutes', value: metrics.totalStudyMinutes, icon: Clock },
                  { label: 'Sessions', value: metrics.completedSessions, icon: CheckCircle2 },
                  { label: 'Streak', value: `${metrics.currentStreak}d`, icon: Flame },
                  { label: 'To review', value: metrics.toReview, icon: Trophy },
                ].map((item) => {
                  const Icon = item.icon

                  return (
                    <div key={item.label} className="rounded-xl border border-border bg-background/70 p-4">
                      <Icon size={16} className="text-purple" />
                      <p className="mt-3 text-2xl font-extrabold text-foreground">{item.value}</p>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{item.label}</p>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Recent exam signal</p>
              {metrics.recentActivity.length > 0 ? (
                <div className="mt-4 space-y-3">
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
                <p className="mt-4 text-sm leading-6 text-muted">Complete a study session to build exam signals.</p>
              )}
            </section>
          </aside>
        </section>
      </main>
    </div>
  )
}
