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
  CheckCircle2,
  Plus,
  type LucideIcon,
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
type CapsuleMode = 'create' | 'library' | 'study'

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
  const [mode, setMode] = useState<CapsuleMode>('create')
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
  const activeCapsule = selectedCapsule ?? capsules.find((capsule) => capsule.id === activeSession?.relatedCapsuleId) ?? null
  const canStartSelectedCapsule = Boolean(activeCapsule && capsules.some((capsule) => capsule.id === activeCapsule.id))

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
      setMode('create')
    }, 3200)
  }

  const handleSaveCapsule = (capsule: StoredCapsule) => {
    setCapsules((currentCapsules) => {
      if (currentCapsules.some((currentCapsule) => currentCapsule.id === capsule.id)) {
        return currentCapsules
      }

      return [capsule, ...currentCapsules]
    })
    setSelectedCapsule(capsule)
  }

  const handleOpenCapsule = (capsule: StoredCapsule) => {
    setSelectedCapsule(capsule)
    setMode('study')
  }

  const handleResumeStudy = (capsule: StoredCapsule) => {
    const savedCapsule = capsules.find((currentCapsule) => currentCapsule.id === capsule.id)

    if (!savedCapsule) {
      setSelectedCapsule(null)
      return
    }

    setSelectedCapsule(capsule)
    setMode('study')

    if (!activeSession) {
      startSession({
        source: 'capsule',
        title: capsule.title,
        plannedMinutes: Math.max(1, Math.ceil(capsule.content.length / 500)),
        relatedCapsuleId: capsule.id,
      })
    }
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

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-purple">Study capsules</p>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Make one capsule, save it, then study it.
            </h1>
            <p className="mt-5 text-base leading-7 text-muted sm:text-lg">
              A clearer path from raw notes to a focused study session.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="grid grid-cols-5 gap-2">
              {([
                ['Paste Notes', BookOpen],
                ['Generate', Zap],
                ['Review', Eye],
                ['Save', Save],
                ['Study', Clock],
              ] satisfies Array<[string, LucideIcon]>).map(([label, Icon], index) => (
                <div key={label} className="text-center">
                  <div className="mx-auto grid size-9 place-items-center rounded-lg border border-purple/15 bg-purple/5 text-purple">
                    <Icon size={16} />
                  </div>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-muted">{label}</p>
                  {index < 4 && <div className="mx-auto mt-2 hidden h-px w-full bg-border sm:block" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-7xl space-y-6 px-6">
        <nav className="grid gap-3 rounded-2xl border border-border bg-card p-2 shadow-sm md:grid-cols-3" aria-label="Capsule modes">
          {([
            { id: 'create', label: 'Create Capsule', helper: 'Paste and generate', icon: Sparkles },
            { id: 'library', label: 'Capsule Library', helper: `${capsules.length} saved`, icon: BookOpen },
            {
              id: 'study',
              label: 'Study Session',
              helper: isCapsuleSessionActive ? `${elapsedDisplay} active` : activeCapsule ? activeCapsule.title : 'Choose a capsule',
              icon: Clock,
            },
          ] satisfies Array<{ id: CapsuleMode; label: string; helper: string; icon: LucideIcon }>).map((item) => {
            const Icon = item.icon
            const isActive = mode === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors duration-200 ${
                  isActive ? 'border-purple/30 bg-purple/5 text-foreground' : 'border-transparent text-muted hover:bg-background/70'
                }`}
              >
                <span className={`grid size-10 shrink-0 place-items-center rounded-lg border ${isActive ? 'border-purple/20 bg-purple/10 text-purple' : 'border-border bg-background text-muted'}`}>
                  <Icon size={19} />
                </span>
                <span className="min-w-0">
                  <span className="block font-extrabold">{item.label}</span>
                  <span className="block truncate text-sm text-muted">{item.helper}</span>
                </span>
              </button>
            )
          })}
        </nav>

        {mode === 'create' && (
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple">Create capsule</p>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">Paste notes</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                    Paste class notes, textbook excerpts, or a revision outline. Generate one capsule at a time.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wider text-muted">
                  <span>{input.length} characters</span>
                  <span>{estimatedReadMinutes}m read</span>
                </div>
              </div>

              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Paste notes, textbook text, transcript, or revision material..."
                className="h-72 w-full resize-none rounded-xl border border-border bg-background/70 p-5 text-base leading-8 text-foreground placeholder:text-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-purple/20 sm:text-lg"
              />

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-xl text-sm leading-6 text-muted">Next step: generate a capsule, review it, then save it to your library.</p>
                <Button onClick={handleGenerate} disabled={!input.trim() || isGenerating || Boolean(activeSession)} className="gap-2" variant="secondary">
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Generating
                    </>
                  ) : (
                    <>
                      <Zap size={18} fill="currentColor" />
                      Generate Capsule
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
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Review and save</p>
              {isGenerating ? (
                <div className="workflow-enter mt-5">
                  <div className="flex items-center gap-3">
                    <Sparkles size={20} className="text-purple" />
                    <div>
                      <h2 className="text-xl font-extrabold text-foreground">Building capsule</h2>
                      <p className="mt-1 text-sm text-muted">{loadingMessages[loadingStep]}</p>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-3">
                    <div className="skeleton-shimmer h-20 rounded-xl bg-border/50" />
                    <div className="skeleton-shimmer h-20 rounded-xl bg-border/50" />
                    <div className="skeleton-shimmer h-20 rounded-xl bg-border/50" />
                  </div>
                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-purple progress-transition"
                      style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
                    />
                  </div>
                </div>
              ) : selectedCapsule ? (
                <div className="workflow-enter mt-5 space-y-5">
                  <div className="rounded-2xl border border-purple/20 bg-purple/5 p-4">
                    <div className="flex items-start gap-3">
                      <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-card text-purple">
                        <Atom size={20} />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-lg font-extrabold text-foreground">{selectedCapsule.title}</h2>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">
                          {selectedCapsule.subject} - {selectedCapsule.generated.difficulty}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-muted">{selectedCapsule.generated.summary}</p>
                  </div>

                  <div className="space-y-2">
                    {selectedCapsule.generated.quickRevisionPoints.slice(0, 3).map((point, index) => (
                      <div key={point} className="flex gap-3 rounded-xl border border-border bg-background/70 p-3 text-sm leading-6 text-muted">
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-purple text-[10px] font-bold text-purple-foreground">
                          {index + 1}
                        </span>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {!selectedCapsuleSaved ? (
                      <Button variant="secondary" onClick={() => handleSaveCapsule(selectedCapsule)} className="gap-2">
                        <Save size={16} />
                        Save Capsule
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => setMode('library')} className="gap-2">
                        <CheckCircle2 size={16} />
                        Saved
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (selectedCapsuleSaved) {
                          setMode('study')
                        }
                      }}
                      disabled={!selectedCapsuleSaved}
                      className="gap-2"
                    >
                      <Clock size={16} />
                      Study
                    </Button>
                  </div>
                  <Button variant="ghost" onClick={() => setMode('study')} className="w-full gap-2">
                    <Eye size={16} />
                    Review Full Capsule
                  </Button>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-border bg-background/60 p-5">
                  <div className="grid size-12 place-items-center rounded-xl border border-border bg-card text-muted">
                    <BookOpen size={24} />
                  </div>
                  <h2 className="mt-4 text-lg font-extrabold text-foreground">Your capsule will appear here</h2>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    This keeps generation and review in one focused place before the capsule joins your library.
                  </p>
                </div>
              )}
            </aside>
          </section>
        )}

        {mode === 'library' && (
          <section>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple">Capsule library</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">Saved capsules</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Open a capsule to review it, resume study, or remove it from local storage.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setMode('create')} className="gap-2 self-start sm:self-auto">
                <Plus size={14} />
                New Capsule
              </Button>
            </div>

            {capsules.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/70 p-8 text-center shadow-sm">
                <div className="mx-auto grid size-12 place-items-center rounded-xl border border-border bg-background text-muted">
                  <BookOpen size={24} />
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-foreground">Start your capsule library</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                  Generate a capsule from your notes, review it, and save it here for future study sessions.
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setMode('create')}>
                  Create First Capsule
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {capsules.map((capsule) => {
                  const isSelected = activeCapsule?.id === capsule.id

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

                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">{capsule.generated.summary}</p>

                      <div className="mt-5 grid gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenCapsule(capsule)} className="gap-2">
                          <Eye size={14} />
                          Review and Study
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResumeStudy(capsule)}
                            disabled={Boolean(activeSession)}
                            className="gap-2"
                          >
                            <RotateCcw size={14} />
                            Resume
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleDeleteCapsule(capsule.id)} className="gap-2">
                            <Trash2 size={14} />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {mode === 'study' && (
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              {activeCapsule ? (
                <>
                  <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple">Study session</p>
                      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">{activeCapsule.title}</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                        Review the capsule, answer the practice prompts, and track a timed pass when you are ready.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setMode('library')} className="gap-2 self-start sm:self-auto">
                      <BookOpen size={14} />
                      Choose Capsule
                    </Button>
                  </div>
                  <CapsuleCard
                    topic={activeCapsule.title}
                    summary={activeCapsule.generated.summary}
                    concepts={activeCapsule.generated.keyConcepts}
                    terms={activeCapsule.generated.importantTerms}
                    revisionPoints={activeCapsule.generated.quickRevisionPoints}
                    practiceQuestions={activeCapsule.generated.practiceQuestions}
                    time={`${Math.max(1, Math.ceil(activeCapsule.content.length / 500))}m`}
                    difficulty={activeCapsule.generated.difficulty}
                    icon={Atom}
                  />
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card/70 p-8 text-center shadow-sm">
                  <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-border bg-background text-muted">
                    <Clock size={28} />
                  </div>
                  <h2 className="mt-5 text-xl font-extrabold text-foreground">Choose a capsule to study</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                    Study sessions start from saved capsules, so your review time can be saved to dashboard history.
                  </p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setMode(capsules.length > 0 ? 'library' : 'create')}>
                    {capsules.length > 0 ? 'Open Library' : 'Create Capsule'}
                  </Button>
                </div>
              )}
            </div>

            <aside className="space-y-4">
              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-xl border border-purple/15 bg-purple/5 text-purple">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Timer</p>
                    <h2 className="text-xl font-extrabold text-foreground">
                      {isCapsuleSessionActive ? activeSession.status : hasOtherActiveSession ? 'Active elsewhere' : 'Ready'}
                    </h2>
                  </div>
                </div>

                {isCapsuleSessionActive && activeSession ? (
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
                    <p className="text-sm leading-6 text-muted">Ending the session saves this study time to your dashboard history.</p>
                  </div>
                ) : (
                  <div className="session-state-transition mt-6 space-y-4">
                    <p className="text-sm leading-6 text-muted">
                      {hasOtherActiveSession
                        ? 'Finish the current active session before starting a capsule session.'
                        : canStartSelectedCapsule
                          ? 'Start a focused pass through this capsule.'
                          : 'Save or choose a capsule before starting a session.'}
                    </p>
                    {activeCapsule && !canStartSelectedCapsule && (
                      <Button variant="secondary" onClick={() => handleSaveCapsule(activeCapsule)} className="w-full gap-2">
                        <Save size={16} />
                        Save Capsule
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        if (activeCapsule) {
                          handleResumeStudy(activeCapsule)
                        }
                      }}
                      disabled={!canStartSelectedCapsule || Boolean(activeSession)}
                      className="w-full gap-2"
                    >
                      <Clock size={16} />
                      Start Study Session
                    </Button>
                  </div>
                )}
              </section>

              {activeCapsule && (
                <>
                  <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Original notes</p>
                    <p className="mt-2 text-sm font-semibold text-foreground">{activeCapsule.subject}</p>
                    <p className="mt-3 max-h-48 overflow-y-auto whitespace-pre-wrap text-sm leading-6 text-muted">{activeCapsule.content}</p>
                  </section>

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
                </>
              )}
            </aside>
          </section>
        )}
      </main>
    </div>
  )
}
