import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { ThemeToggle } from '../components/ThemeToggle'
import { CapsuleCard } from '../components/capsules/CapsuleCard'
import { InsightCard } from '../components/capsules/InsightCard'
import { SubjectCard } from '../components/capsules/SubjectCard'
import {
  Sparkles,
  Zap,
  Loader2,
  BookOpen,
  ArrowLeft,
  Clock,
} from 'lucide-react'
import type { View } from '../types/navigation'
import { capsuleInsights, loadingMessages, recentSubjects, sampleCapsule } from '../mocks/capsuleData'
import { useStudy } from '../study/studyContext'

interface StudyCapsulesPageProps {
  onNavigate: (view: View) => void
}

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

export default function StudyCapsulesPage({ onNavigate }: StudyCapsulesPageProps) {
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [showCapsule, setShowCapsule] = useState(false)
  const { activeSession, elapsedSeconds, endSession, pauseSession, resumeSession, startSession } = useStudy()
  const isCapsuleSessionActive = activeSession?.source === 'capsule'
  const hasOtherActiveSession = Boolean(activeSession && !isCapsuleSessionActive)
  const elapsedDisplay = formatElapsed(elapsedSeconds)
  const estimatedReadMinutes = Math.max(1, Math.ceil(input.length / 500))

  const handleGenerate = () => {
    if (!input.trim()) return
    const plannedMinutes = estimatedReadMinutes
    startSession({
      source: 'capsule',
      title: sampleCapsule.topic,
      plannedMinutes,
    })
    setIsGenerating(true)
    setShowCapsule(false)
    setLoadingStep(0)

    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < loadingMessages.length - 1 ? prev + 1 : prev))
    }, 600)

    setTimeout(() => {
      clearInterval(interval)
      setIsGenerating(false)
      setShowCapsule(true)
      window.scrollTo({ top: 500, behavior: 'smooth' })
    }, 3200)
  }

  return (
    <div className="min-h-screen bg-background pb-40 transition-colors duration-500">
      <header className="mx-auto max-w-7xl px-6 pt-6 lg:pt-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')} className="gap-2">
            <ArrowLeft size={16} />
            Back to dashboard
          </Button>
          <ThemeToggle />
        </div>

        <div className="mt-10 max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted">Study capsules</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Convert notes into focused study material.
          </h1>
          <p className="mt-5 text-base leading-7 text-muted sm:text-lg">
            Create a structured capsule, review it like an exam sheet, then study it in a timed session that is saved to your history.
          </p>
        </div>
      </header>

      <main className="mx-auto mt-10 max-w-7xl space-y-6 px-6">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple">Step 1</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">Source material</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                  Paste class notes, textbook excerpts, or a revision outline. The capsule will keep the important ideas visible.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wider text-muted">
                <span>{input.length} characters</span>
                <span>{estimatedReadMinutes}m read</span>
              </div>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste notes, textbook text, transcript, or revision material..."
              className="h-64 w-full resize-none rounded-xl border border-border bg-background/70 p-5 text-base leading-8 text-foreground placeholder:text-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-purple/20 sm:text-lg"
            />

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-sm leading-6 text-muted">
                Clear source material creates a cleaner study sheet. You can edit the text before creating a capsule.
              </p>
              <Button
                onClick={handleGenerate}
                disabled={!input.trim() || isGenerating || Boolean(activeSession)}
                className="gap-2"
                variant="secondary"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Creating capsule
                  </>
                ) : (
                  <>
                    <Zap size={18} fill="currentColor" />
                    Create capsule
                  </>
                )}
              </Button>
            </div>
          </div>

          <aside className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-xl border border-purple/15 bg-purple/5 text-purple">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Study session</p>
                <h2 className="text-xl font-extrabold text-foreground">
                  {isCapsuleSessionActive ? activeSession.status : hasOtherActiveSession ? 'Active elsewhere' : 'Ready'}
                </h2>
              </div>
            </div>

            {isCapsuleSessionActive ? (
              <div className="session-state-transition mt-6 space-y-5">
                <div className="rounded-2xl border border-border bg-background/70 p-4">
                  <p className="text-sm font-semibold text-foreground">{activeSession.title}</p>
                  <p className="mt-2 text-4xl font-extrabold tabular-nums tracking-tight text-foreground">{elapsedDisplay}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">active study time</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {activeSession.status === 'running' ? (
                    <Button onClick={pauseSession} variant="outline">
                      Pause
                    </Button>
                  ) : (
                    <Button onClick={resumeSession} variant="outline">
                      Resume
                    </Button>
                  )}
                  <Button onClick={endSession} variant="outline">
                    End
                  </Button>
                </div>
                <p className="text-sm leading-6 text-muted">
                  Ending the session saves this study time to your dashboard history.
                </p>
              </div>
            ) : (
              <div className="session-state-transition mt-6 rounded-2xl border border-dashed border-border bg-background/60 p-5">
                <p className="text-sm leading-6 text-muted">
                  {hasOtherActiveSession
                    ? 'Finish or pause the current active session before starting a capsule session.'
                    : 'Create a capsule to begin a focused study session. The timer will appear here.'}
                </p>
              </div>
            )}
          </aside>
        </section>

        {isGenerating && (
          <section className="workflow-enter rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-purple" />
              <div>
                <h2 className="text-xl font-extrabold text-foreground">Building your study sheet</h2>
                <p className="mt-1 text-sm text-muted">{loadingMessages[loadingStep]}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="skeleton-shimmer h-24 rounded-xl bg-border/50" />
              <div className="skeleton-shimmer h-24 rounded-xl bg-border/50" />
              <div className="skeleton-shimmer h-24 rounded-xl bg-border/50" />
            </div>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-purple progress-transition"
                style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
              />
            </div>
          </section>
        )}

        {!showCapsule && !isGenerating && (
          <section className="rounded-2xl border border-dashed border-border bg-card/70 p-8 text-center shadow-sm">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-border bg-background text-muted">
              <BookOpen size={28} />
            </div>
            <h2 className="mt-5 text-xl font-extrabold text-foreground">No capsule yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              Add source material above to create a study sheet with summary, key points, formulas, and review guidance.
            </p>
          </section>
        )}

        {showCapsule && (
          <section className="workflow-enter grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple">Step 2</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">Academic study sheet</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                  Review the capsule as structured revision material, then use the session panel to save focused study time.
                </p>
              </div>
              <CapsuleCard
                topic={sampleCapsule.topic}
                summary={sampleCapsule.summary}
                concepts={sampleCapsule.concepts}
                formulas={sampleCapsule.formulas}
                tips={sampleCapsule.tips}
                time={sampleCapsule.time}
                difficulty={sampleCapsule.difficulty}
                icon={sampleCapsule.icon}
              />
            </div>

            <aside className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Learning signals</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">Insights</h2>
              </div>
              {capsuleInsights.map((insight) => (
                <InsightCard
                  key={insight.label}
                  label={insight.label}
                  value={insight.value}
                  icon={insight.icon}
                  description={insight.description}
                  color={insight.color}
                  progress={insight.progress}
                />
              ))}
            </aside>
          </section>
        )}

        <section>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Library preview</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">Recent capsules</h2>
            </div>
            <Button variant="ghost" size="sm" className="self-start text-purple sm:self-auto">
              View Library
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentSubjects.map((subject) => (
              <SubjectCard
                key={subject.subject}
                subject={subject.subject}
                icon={subject.icon}
                lastStudied={subject.lastStudied}
                progress={subject.progress}
                streak={subject.streak}
                color={subject.color}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
