import { useEffect, useState } from 'react'
import { Button } from '../components/ui/Button'
import { ThemeToggle } from '../components/ThemeToggle'
import { CapsuleCard } from '../components/capsules/CapsuleCard'
import { InsightCard } from '../components/capsules/InsightCard'
import {
  Sparkles,
  Zap,
  Loader2,
  BookOpen,
  ArrowLeft,
  Clock,
  Trash2,
  Eye,
  RotateCcw,
  Atom,
  Save,
} from 'lucide-react'
import type { View } from '../types/navigation'
import { capsuleInsights, loadingMessages } from '../mocks/capsuleData'
import { generateCapsuleFromNotes, type GeneratedCapsuleContent } from '../study/capsuleGenerator'
import { useStudy } from '../study/studyContext'

interface StudyCapsulesPageProps {
  onNavigate: (view: View) => void
}

interface StoredCapsule {
  id: string
  title: string
  subject: string
  createdAt: string
  content: string
  generated: GeneratedCapsuleContent
}

const storageKey = 'studyspark.capsuleLibrary'

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function createFallbackGeneratedContent(content: string): GeneratedCapsuleContent {
  const firstLine = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean)
  const fallbackPoint = firstLine || 'Review the original notes carefully.'

  return {
    summary: fallbackPoint,
    keyConcepts: [fallbackPoint],
    importantTerms: [inferSubject(content)],
    quickRevisionPoints: [fallbackPoint],
    practiceQuestions: [`Explain ${inferSubject(content)} in your own words.`],
    difficulty: 'Easy',
  }
}

function safelyGenerateCapsuleContent(content: string) {
  try {
    return generateCapsuleFromNotes(content)
  } catch {
    return createFallbackGeneratedContent(content)
  }
}

function isStoredCapsule(value: unknown): value is StoredCapsule {
  if (!value || typeof value !== 'object') {
    return false
  }

  const capsule = value as Partial<StoredCapsule>

  return (
    typeof capsule.id === 'string' &&
    typeof capsule.title === 'string' &&
    typeof capsule.subject === 'string' &&
    typeof capsule.createdAt === 'string' &&
    typeof capsule.content === 'string' &&
    isGeneratedCapsuleContent(capsule.generated)
  )
}

function isGeneratedCapsuleContent(value: unknown): value is GeneratedCapsuleContent {
  if (!value || typeof value !== 'object') {
    return false
  }

  const generated = value as Partial<GeneratedCapsuleContent>

  return (
    typeof generated.summary === 'string' &&
    Array.isArray(generated.keyConcepts) &&
    generated.keyConcepts.every((concept) => typeof concept === 'string') &&
    Array.isArray(generated.importantTerms) &&
    generated.importantTerms.every((term) => typeof term === 'string') &&
    Array.isArray(generated.quickRevisionPoints) &&
    generated.quickRevisionPoints.every((point) => typeof point === 'string') &&
    Array.isArray(generated.practiceQuestions) &&
    generated.practiceQuestions.every((question) => typeof question === 'string') &&
    (generated.difficulty === 'Easy' || generated.difficulty === 'Medium' || generated.difficulty === 'Hard')
  )
}

function migrateStoredCapsule(value: unknown): StoredCapsule | null {
  if (isStoredCapsule(value)) {
    return value
  }

  if (!value || typeof value !== 'object') {
    return null
  }

  const capsule = value as {
    id?: unknown
    title?: unknown
    subject?: unknown
    content?: unknown
    generated?: unknown
    topic?: unknown
    createdAt?: unknown
    sourceMaterial?: unknown
  }
  const id = typeof capsule.id === 'string' ? capsule.id : null
  const createdAt = typeof capsule.createdAt === 'string' ? capsule.createdAt : null
  const content =
    typeof capsule.content === 'string'
      ? capsule.content
      : typeof capsule.sourceMaterial === 'string'
        ? capsule.sourceMaterial
        : null
  const title =
    typeof capsule.title === 'string'
      ? capsule.title
      : typeof capsule.topic === 'string'
        ? capsule.topic
        : content
          ? getGeneratedTitle(content)
          : null

  if (!id || !createdAt || !content || !title) {
    return null
  }

  return {
    id,
    title,
    subject: typeof capsule.subject === 'string' ? capsule.subject : inferSubject(content),
    createdAt,
    content,
    generated: isGeneratedCapsuleContent(capsule.generated) ? capsule.generated : safelyGenerateCapsuleContent(content),
  }
}

function loadCapsules(): StoredCapsule[] {
  try {
    const storedValue = localStorage.getItem(storageKey)

    if (!storedValue) {
      return []
    }

    const parsedValue = JSON.parse(storedValue)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.map(migrateStoredCapsule).filter((capsule): capsule is StoredCapsule => Boolean(capsule))
  } catch {
    return []
  }
}

function getGeneratedTitle(content: string) {
  const firstLine = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean)

  if (!firstLine) {
    return 'Study Capsule'
  }

  return firstLine.length > 56 ? `${firstLine.slice(0, 53)}...` : firstLine
}

function inferSubject(content: string) {
  const firstLine = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean)

  if (!firstLine) {
    return 'General'
  }

  const subjectMatch = firstLine.match(/^subject:\s*(.+)$/i)

  if (subjectMatch?.[1]) {
    return subjectMatch[1].trim().slice(0, 40) || 'General'
  }

  return firstLine.split(/[,:;-]/)[0]?.trim().slice(0, 40) || 'General'
}

function createCapsule(content: string): StoredCapsule {
  return {
    id: crypto.randomUUID(),
    title: getGeneratedTitle(content),
    subject: inferSubject(content),
    createdAt: new Date().toISOString(),
    content,
    generated: generateCapsuleFromNotes(content),
  }
}

export default function StudyCapsulesPage({ onNavigate }: StudyCapsulesPageProps) {
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [selectedCapsule, setSelectedCapsule] = useState<StoredCapsule | null>(null)
  const [capsules, setCapsules] = useState<StoredCapsule[]>(() => loadCapsules())
  const { activeSession, elapsedSeconds, endSession, pauseSession, removeCapsuleStudyState, resumeSession, startSession } = useStudy()
  const isCapsuleSessionActive = activeSession?.source === 'capsule'
  const hasOtherActiveSession = Boolean(activeSession && !isCapsuleSessionActive)
  const elapsedDisplay = formatElapsed(elapsedSeconds)
  const estimatedReadMinutes = Math.max(1, Math.ceil(input.length / 500))
  const selectedCapsuleSaved = Boolean(selectedCapsule && capsules.some((capsule) => capsule.id === selectedCapsule.id))

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(capsules))
  }, [capsules])

  const handleGenerate = () => {
    const trimmedInput = input.trim()

    if (!trimmedInput) {
      setGenerationError('Paste study notes before creating a capsule.')
      return
    }

    let nextCapsule: StoredCapsule

    try {
      nextCapsule = createCapsule(trimmedInput)
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'StudySpark could not read enough structure from those notes.')
      return
    }

    setIsGenerating(true)
    setSelectedCapsule(null)
    setGenerationError(null)
    setLoadingStep(0)

    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev))
    }, 600)

    setTimeout(() => {
      clearInterval(interval)
      setSelectedCapsule(nextCapsule)
      setIsGenerating(false)
      setInput('')
      window.scrollTo({ top: 500, behavior: 'smooth' })
    }, 3200)
  }

  const handleSaveCapsule = (capsule: StoredCapsule) => {
    setCapsules((currentCapsules) => {
      if (currentCapsules.some((currentCapsule) => currentCapsule.id === capsule.id)) {
        return currentCapsules
      }

      return [capsule, ...currentCapsules]
    })
  }

  const handleOpenCapsule = (capsule: StoredCapsule) => {
    setSelectedCapsule(capsule)
    window.scrollTo({ top: 500, behavior: 'smooth' })
  }

  const handleResumeStudy = (capsule: StoredCapsule) => {
    const savedCapsule = capsules.find((currentCapsule) => currentCapsule.id === capsule.id)

    if (!savedCapsule) {
      setSelectedCapsule(null)
      return
    }

    setSelectedCapsule(capsule)

    if (!activeSession) {
      startSession({
        source: 'capsule',
        title: capsule.title,
        plannedMinutes: Math.max(1, Math.ceil(capsule.content.length / 500)),
        relatedCapsuleId: capsule.id,
      })
    }

    window.scrollTo({ top: 500, behavior: 'smooth' })
  }

  const handleDeleteCapsule = (capsuleId: string) => {
    const capsuleToDelete = capsules.find((capsule) => capsule.id === capsuleId)

    setCapsules((currentCapsules) => currentCapsules.filter((capsule) => capsule.id !== capsuleId))

    if (selectedCapsule?.id === capsuleId) {
      setSelectedCapsule(null)
    }

    if (capsuleToDelete) {
      removeCapsuleStudyState({
        capsuleId: capsuleToDelete.id,
        title: capsuleToDelete.title,
      })
    }
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
            Create a structured capsule, save it to your library, and resume study whenever you need another pass.
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
                  Paste class notes, textbook excerpts, or a revision outline. Save the finished capsule locally after generation.
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
                Generated capsules can be saved to the library below and remain available after refresh.
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
            {generationError && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm font-medium leading-6 text-red-500">
                {generationError}
              </div>
            )}
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
                    ? 'Finish the current active session before starting a capsule session.'
                    : 'Create or resume a capsule to begin a focused study session.'}
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

        {!selectedCapsule && !isGenerating && (
          <section className="rounded-2xl border border-dashed border-border bg-card/70 p-8 text-center shadow-sm">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-border bg-background text-muted">
              <BookOpen size={28} />
            </div>
            <h2 className="mt-5 text-xl font-extrabold text-foreground">No capsule open</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              Create a new capsule or open one from your library to view its details.
            </p>
          </section>
        )}

        {selectedCapsule && !isGenerating && (
          <section className="workflow-enter grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple">Capsule details</p>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">Academic study sheet</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                    {selectedCapsuleSaved ? `Saved ${formatDate(selectedCapsule.createdAt)}.` : 'Generated capsule is ready to save.'} Resume the capsule to start another timed study pass.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 self-start sm:self-auto">
                  {!selectedCapsuleSaved && (
                    <Button variant="secondary" onClick={() => handleSaveCapsule(selectedCapsule)} className="gap-2">
                      <Save size={16} />
                      Save Capsule
                    </Button>
                  )}
                  {selectedCapsuleSaved && (
                    <Button
                      variant="outline"
                      onClick={() => handleResumeStudy(selectedCapsule)}
                      disabled={Boolean(activeSession)}
                      className="gap-2"
                    >
                      <RotateCcw size={16} />
                      Resume Study
                    </Button>
                  )}
                </div>
              </div>
              <CapsuleCard
                topic={selectedCapsule.title}
                summary={selectedCapsule.generated.summary}
                concepts={selectedCapsule.generated.keyConcepts}
                terms={selectedCapsule.generated.importantTerms}
                revisionPoints={selectedCapsule.generated.quickRevisionPoints}
                practiceQuestions={selectedCapsule.generated.practiceQuestions}
                time={`${Math.max(1, Math.ceil(selectedCapsule.content.length / 500))}m`}
                difficulty={selectedCapsule.generated.difficulty}
                icon={Atom}
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
              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Content</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{selectedCapsule.subject}</p>
                <p className="mt-3 max-h-48 overflow-y-auto whitespace-pre-wrap text-sm leading-6 text-muted">
                  {selectedCapsule.content}
                </p>
              </section>
            </aside>
          </section>
        )}

        <section>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Library</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">Saved capsules</h2>
            </div>
            <span className="self-start rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted sm:self-auto">
              {capsules.length} saved
            </span>
          </div>

          {capsules.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/70 p-8 text-center shadow-sm">
              <div className="mx-auto grid size-12 place-items-center rounded-xl border border-border bg-background text-muted">
                <BookOpen size={24} />
              </div>
              <h3 className="mt-4 text-lg font-extrabold text-foreground">No capsules saved</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                Create a capsule from your notes, then save it here for review and study sessions.
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Create First Capsule
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {capsules.map((capsule) => {
                const isSelected = selectedCapsule?.id === capsule.id

                return (
                  <article
                    key={capsule.id}
                    className={`rounded-2xl border bg-card p-5 shadow-sm transition-colors duration-200 ${
                      isSelected ? 'border-purple/40' : 'border-border hover:border-purple/25'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-purple/15 bg-purple/5 text-purple">
                        <Atom size={21} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-extrabold text-foreground">{capsule.title}</h3>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">
                          {capsule.subject} - {formatDate(capsule.createdAt)}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">{capsule.content}</p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenCapsule(capsule)} className="gap-2">
                        <Eye size={14} />
                        Open Capsule
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResumeStudy(capsule)}
                        disabled={Boolean(activeSession)}
                        className="gap-2"
                      >
                        <RotateCcw size={14} />
                        Resume Study
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCapsule(capsule.id)} className="gap-2 text-muted">
                        <Trash2 size={14} />
                        Delete
                      </Button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
