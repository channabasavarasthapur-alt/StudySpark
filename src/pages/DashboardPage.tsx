import type { View } from '../types/navigation'
import { BentoCard } from '../components/ui/BentoCard'
import { Button } from '../components/ui/Button'
import { ReadinessBar } from '../components/ui/ReadinessBar'
import { ThemeToggle } from '../components/ThemeToggle'
import { Zap, Plus, ArrowRight, Trophy, Clock, BookOpen } from 'lucide-react'
import { dashboardData } from '../mocks/dashboardData'
import { useStudy, type StudySessionSource } from '../study/studyContext'

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

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

function formatSessionDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
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
  const { activeSession, elapsedSeconds, metrics } = useStudy()
  const hasActivity = metrics.recentActivity.length > 0
  const activeSource = activeSession ? sourceLabels[activeSession.source] : null
  const nextActionTitle = activeSession ? activeSession.title : dashboardData.currentMission.title
  const nextActionDescription = activeSession
    ? `${activeSource} is ${activeSession.status}. ${formatElapsed(elapsedSeconds)} studied so far.`
    : 'Start a focused study session, then return here to see your progress update automatically.'
  const suggestedTasks = dashboardData.syllabus.tasks.slice(0, 3)
  const studyPlanItems = hasActivity
    ? metrics.recentActivity.slice(0, 4).map((session) => ({
        id: session.id,
        title: session.title,
        meta: `${sourceLabels[session.source]} - ${session.durationMinutes}m - ${formatSessionDate(session.completedAt)}`,
        ctaLabel: 'Resume',
        icon: <Zap size={16} fill="currentColor" />,
        iconClassName: 'border-purple/20 bg-purple/10 text-purple',
        hoverClassName: 'hover:border-purple/35 hover:bg-purple/5',
      }))
    : suggestedTasks.map((task) => ({
        id: task.title,
        title: task.title,
        meta: `${task.time} - suggested`,
        ctaLabel: 'Start',
        icon: 'GO',
        iconClassName: 'border-purple/15 bg-purple/5 text-xs font-bold text-purple',
        hoverClassName: 'hover:border-purple/35 hover:bg-purple/5',
      }))

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
                  {nextActionTitle}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{nextActionDescription}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                <Button size="lg" className="gap-2" onClick={() => onNavigate('capsules')}>
                  <Zap size={18} fill="currentColor" />
                  {activeSession ? 'Return to Session' : 'Start Studying'}
                </Button>
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
                <button
                  key={metric.label}
                  type="button"
                  aria-label={`${metric.label}: ${metric.value}, ${metric.helper}`}
                  className="rounded-xl border border-border bg-background/70 p-4 text-left transition-colors duration-200 hover:border-purple/50 hover:bg-purple/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple"
                >
                  <p className="text-2xl font-extrabold tabular-nums text-foreground">{metric.value}</p>
                  <p className="mt-1 text-sm font-medium text-muted">{metric.label}</p>
                  <p className="mt-2 text-xs leading-5 text-muted">{metric.helper}</p>
                </button>
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
            description={hasActivity ? 'Recent completed work is shown first.' : 'Suggested starting points are shown until your first completed session.'}
            icon={<Trophy size={20} className="text-purple" />}
          >
            <div className="mt-6 h-[360px] space-y-3 overflow-y-auto pr-1">
              {studyPlanItems.map((item) => (
                <div
                  key={item.id}
                  className={`group flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-border bg-background/70 p-4 transition-colors duration-200 sm:flex-row sm:items-center ${item.hoverClassName}`}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className={`grid size-11 shrink-0 place-items-center rounded-xl border ${item.iconClassName}`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-foreground">{item.title}</h3>
                      <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted">{item.meta}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0 self-start gap-2 sm:self-auto" onClick={() => onNavigate('capsules')}>
                    {item.ctaLabel}
                    <ArrowRight size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </BentoCard>

          <div className="grid min-w-0 gap-6">
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
                    <button
                      key={session.id}
                      type="button"
                      aria-label={`${session.title}, ${sourceLabels[session.source]}, ${session.durationMinutes} minutes, completed ${formatSessionDateTime(session.completedAt)}`}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-transparent p-3 text-left transition-colors duration-200 hover:border-purple/30 hover:bg-purple/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{session.title}</p>
                        <p className="truncate text-xs text-muted">{formatSessionDateTime(session.completedAt)}</p>
                      </div>
                      <span className="rounded-full bg-purple/10 px-2.5 py-1 text-xs font-semibold text-purple">
                        {session.durationMinutes}m
                      </span>
                    </button>
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
