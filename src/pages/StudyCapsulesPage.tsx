import { useEffect, useState } from 'react'
import { Button } from '../components/ui/Button'
import { ThemeToggle } from '../components/ThemeToggle'
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Play,
} from 'lucide-react'
import type { View } from '../types/navigation'
import { capsuleInsights, loadingMessages } from '../mocks/capsuleData'
import { generateCapsuleFromNotes, type GeneratedCapsuleContent } from '../study/capsuleGenerator'
import { useStudy, useStudyTimer } from '../study/studyContext'

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
type CapsuleMode = 'create' | 'review' | 'library' | 'study'

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

function generateUUID() {
  if (typeof window !== 'undefined' && typeof window.crypto !== 'undefined' && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0
    const value = char === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

function createCapsule(content: string): StoredCapsule {
  return {
    id: generateUUID(),
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
  const [focusIndex, setFocusIndex] = useState(0)
  const [pendingCapsule, setPendingCapsule] = useState<StoredCapsule | null>(null)
  const { activeSession, endSession, pauseSession, removeCapsuleStudyState, resumeSession, startSession } = useStudy()
  const { elapsedSeconds } = useStudyTimer()
  
  const isCapsuleSessionActive = activeSession?.source === 'capsule'
  const hasOtherActiveSession = Boolean(activeSession && !isCapsuleSessionActive)
  const elapsedDisplay = formatElapsed(elapsedSeconds)
  const estimatedReadMinutes = Math.max(1, Math.ceil(input.length / 500))
  const selectedCapsuleSaved = Boolean(selectedCapsule && capsules.some((capsule) => capsule.id === selectedCapsule.id))
  const activeCapsule = selectedCapsule ?? capsules.find((capsule) => capsule.id === activeSession?.relatedCapsuleId) ?? null
  const canStartSelectedCapsule = Boolean(activeCapsule && capsules.some((capsule) => capsule.id === activeCapsule.id))
  
  const focusItems = activeCapsule
    ? [
        { label: 'Summary', body: activeCapsule.generated.summary },
        ...activeCapsule.generated.quickRevisionPoints.slice(0, 3).map((point, index) => ({
          label: `Revision ${index + 1}`,
          body: point,
        })),
        ...activeCapsule.generated.practiceQuestions.map((question, index) => ({
          label: `Question ${index + 1}`,
          body: question,
        })),
      ]
    : []
  const currentFocusItem = focusItems[Math.min(focusIndex, Math.max(0, focusItems.length - 1))]

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(capsules))
    } catch (e) {
      console.error('Failed to save capsules to localStorage:', e)
    }
  }, [capsules])

  useEffect(() => {
    if (!isGenerating || !pendingCapsule) {
      return
    }

    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev))
    }, 600)

    const timeout = setTimeout(() => {
      clearInterval(interval)
      setSelectedCapsule(pendingCapsule)
      setIsGenerating(false)
      setPendingCapsule(null)
      setInput('')
    }, 3200)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [isGenerating, pendingCapsule])

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

    setPendingCapsule(nextCapsule)
    setIsGenerating(true)
    setSelectedCapsule(null)
    setGenerationError(null)
    setLoadingStep(0)
    setMode('review') // Switch immediately to Review mode
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
    setFocusIndex(0)
    setMode('study')
  }

  const handleResumeStudy = (capsule: StoredCapsule) => {
    const savedCapsule = capsules.find((currentCapsule) => currentCapsule.id === capsule.id)

    if (!savedCapsule) {
      setSelectedCapsule(null)
      return
    }

    setSelectedCapsule(capsule)
    setFocusIndex(0)
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
    <div className="min-h-screen bg-background pb-[calc(8rem+env(safe-area-inset-bottom))] transition-colors duration-500 sm:pb-[calc(6rem+env(safe-area-inset-bottom))]">
      {/* Header */}
      <header className="mx-auto max-w-5xl px-5 pt-6">
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
            Study Capsules
          </p>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Convert Notes to Focus Blocks
          </h1>
        </div>
      </header>

      <main className="mx-auto mt-6 max-w-5xl px-5 space-y-6">
        {/* Navigation Modes Bar */}
        <nav
          className="flex rounded-xl border border-border bg-card p-1 shadow-sm"
          aria-label="Capsule workflow stages"
        >
          {([
            { id: 'create', label: 'Create', icon: Sparkles },
            { id: 'review', label: 'Review', icon: Eye },
            { id: 'library', label: 'Library', icon: BookOpen },
            { id: 'study', label: 'Study', icon: Clock },
          ] as const).map((item) => {
            const Icon = item.icon
            const isActive = mode === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={`flex flex-1 flex-col items-center justify-center gap-1 py-2.5 rounded-lg border transition-all text-center ${
                  isActive
                    ? 'border-purple/20 bg-purple/5 text-purple font-bold'
                    : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                <Icon size={16} />
                <span className="text-[11px] tracking-tight">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* ── CREATE MODE ────────────────────────────────────────── */}
        {mode === 'create' && (
          <section className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Paste Class Notes</h2>
                  <p className="text-xs text-muted mt-0.5">
                    Input notes or textbook text below to start the AI generation.
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-muted text-right">
                  <span>{input.length} chars</span>
                  <span className="mx-2">·</span>
                  <span>{estimatedReadMinutes}m read</span>
                </div>
              </div>

              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Topic: Quantum Mechanics&#10;&#10;Key points:&#10;- Wave-particle duality&#10;- Heisenberg uncertainty principle&#10;- Schrödinger equation"
                className="min-h-[40vh] w-full resize-y bg-transparent p-5 text-base leading-relaxed text-foreground placeholder:text-muted/50 focus:outline-none sm:min-h-[50vh] sm:p-8"
                aria-label="Paste class notes"
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
                <p className="text-xs text-muted leading-relaxed max-w-md">
                  Once clicked, StudySpark will digest this material and construct revision points, concepts, and terms.
                </p>
                <Button
                  onClick={handleGenerate}
                  disabled={!input.trim() || isGenerating || Boolean(activeSession)}
                  className="w-full sm:w-auto gap-2 min-h-12 text-sm shadow-sm"
                  variant="secondary"
                >
                  <Zap size={15} fill="currentColor" />
                  Generate Study Capsule
                </Button>
              </div>

              {generationError && (
                <div className="rounded-xl border border-red-500/15 bg-red-500/5 p-3 text-xs font-semibold text-red-500">
                  {generationError}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── REVIEW MODE ────────────────────────────────────────── */}
        {mode === 'review' && (
          <section className="space-y-4">
            {isGenerating ? (
              // Generating state
              <div className="rounded-2xl border border-purple/20 bg-card p-6 shadow-sm space-y-5 text-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin text-purple" size={32} />
                  <h3 className="text-lg font-bold text-foreground">Analyzing notes</h3>
                  <p className="text-xs text-muted max-w-xs leading-relaxed">
                    {loadingMessages[loadingStep]}
                  </p>
                </div>
                <div className="max-w-md mx-auto space-y-2 pt-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/10">
                    <div
                      className="h-full rounded-full bg-purple transition-[width] duration-500 ease-out"
                      style={{
                        width: `${((loadingStep + 1) / loadingMessages.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : selectedCapsule ? (
              // Reviewed capsule preview
              <div className="space-y-6">
                <div className="rounded-2xl border border-purple/20 bg-purple/5 p-5 sm:p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-xl bg-card text-purple shadow-sm">
                        <Atom size={20} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-foreground">
                          {selectedCapsule.title}
                        </h2>
                        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                          {selectedCapsule.subject} · {selectedCapsule.generated.difficulty} difficulty
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-muted">
                    {selectedCapsule.generated.summary}
                  </p>
                </div>

                {/* Obvious Save and Study Actions */}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-start pt-2">
                  {!selectedCapsuleSaved ? (
                    <Button
                      variant="secondary"
                      onClick={() => handleSaveCapsule(selectedCapsule)}
                      className="w-full sm:w-auto gap-2 min-h-12 text-sm shadow-sm"
                    >
                      <Save size={15} />
                      Save to Library
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setMode('library')}
                      className="w-full sm:w-auto gap-2 min-h-12 text-sm text-teal border-teal/20 bg-teal/5"
                    >
                      <CheckCircle2 size={15} />
                      Saved in Library
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
                    className="w-full sm:w-auto gap-2 min-h-12 text-sm"
                  >
                    <Clock size={15} />
                    Study This Capsule
                  </Button>
                </div>

                {/* Capsule Quick Revision Points */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted">
                    Revision Highlights
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {selectedCapsule.generated.quickRevisionPoints.slice(0, 3).map((point, index) => (
                      <div
                        key={point}
                        className="flex gap-3 rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-muted"
                      >
                        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-purple/10 text-[10px] font-bold text-purple">
                          {index + 1}
                        </span>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details Accordions */}
                <div className="space-y-2.5">
                  {[
                    { label: 'Key concepts', values: selectedCapsule.generated.keyConcepts },
                    { label: 'Important terms', values: selectedCapsule.generated.importantTerms },
                    { label: 'Practice questions', values: selectedCapsule.generated.practiceQuestions },
                  ].map((accordion) => (
                    <details
                      key={accordion.label}
                      className="group rounded-2xl border border-border bg-card p-4 transition-all"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 min-h-[44px] text-xs font-bold uppercase tracking-widest text-muted">
                        {accordion.label}
                        <ChevronDown
                          size={16}
                          className="shrink-0 text-muted transition-transform group-open:rotate-180"
                        />
                      </summary>
                      <div className="mt-5 space-y-2 border-t border-border/60 pt-5">
                        {accordion.values.map((val, idx) => (
                          <div
                            key={`${val}-${idx}`}
                            className="rounded-lg bg-background p-3 text-xs leading-relaxed text-muted"
                          >
                            {val}
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ) : (
              // Empty State
              <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center shadow-sm space-y-4">
                <div className="mx-auto grid size-12 place-items-center rounded-xl border border-border bg-background text-muted">
                  <Eye size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">No active capsule under review</h3>
                  <p className="mt-1 max-w-sm mx-auto text-xs leading-relaxed text-muted">
                    Paste your study notes in the Create tab, generate a capsule, and it will appear here for review.
                  </p>
                </div>
                <div className="pt-2">
                  <Button variant="outline" size="sm" onClick={() => setMode('create')}>
                    Go to Create Tab
                  </Button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── LIBRARY MODE ───────────────────────────────────────── */}
        {mode === 'library' && (
          <section className="space-y-4">
            {capsules.length === 0 ? (
              // Empty state
              <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center shadow-sm space-y-4">
                <div className="mx-auto grid size-12 place-items-center rounded-xl border border-border bg-background text-muted">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Start your capsule library</h3>
                  <p className="mt-1 max-w-sm mx-auto text-xs leading-relaxed text-muted">
                    Your generated and saved capsules will live here. Use them to start timed study sessions.
                  </p>
                </div>
                <div className="pt-2">
                  <Button variant="outline" size="sm" onClick={() => setMode('create')}>
                    Create First Capsule
                  </Button>
                </div>
              </div>
            ) : (
              // Library grid
              <div className="grid gap-4 sm:grid-cols-2">
                {capsules.map((capsule) => {
                  const isSelected = activeCapsule?.id === capsule.id
                  const isActiveCapsuleSession =
                    activeSession?.source === 'capsule' &&
                    activeSession.relatedCapsuleId === capsule.id

                  return (
                    <article
                      key={capsule.id}
                      className={`flex flex-col justify-between rounded-xl border bg-card p-5 shadow-sm transition-all ${
                        isSelected
                          ? 'border-purple/40 ring-1 ring-purple/20'
                          : 'border-border/80 hover:border-purple/20'
                      }`}
                    >
                      <div className="space-y-3.5">
                        <div className="flex items-start gap-3">
                          <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-purple/10 bg-purple/5 text-purple">
                            <Atom size={20} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-foreground truncate text-base">
                              {capsule.title}
                            </h3>
                            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                              {capsule.subject} · {formatDate(capsule.createdAt)}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs leading-relaxed text-muted line-clamp-2">
                          {capsule.generated.summary}
                        </p>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-2 pt-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleResumeStudy(capsule)}
                          disabled={Boolean(activeSession && !isActiveCapsuleSession)}
                          className="min-h-[44px] text-xs gap-1.5 shadow-sm"
                        >
                          <RotateCcw size={12} />
                          {isActiveCapsuleSession ? 'Resume' : 'Study'}
                        </Button>
                        <div className="grid grid-cols-[1fr_auto] gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenCapsule(capsule)}
                            className="min-h-[44px] text-xs"
                          >
                            Review
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                        if (window.confirm('Delete this capsule?')) {
                          handleDeleteCapsule(capsule.id)
                        }
                      }}
                            className="min-h-[44px] border-red-500/10 bg-red-500/5 hover:bg-red-500/10 text-red-500 px-3"
                            aria-label={`Delete ${capsule.title}`}
                          >
                            <Trash2 size={13} />
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

        {/* ── STUDY MODE ─────────────────────────────────────────── */}
        {mode === 'study' && (
          <section className="relative pb-24 space-y-6">
            {activeCapsule ? (
              <div className="mx-auto max-w-xl space-y-6">
                {/* Minimal Header */}
                <div className="flex items-center justify-between text-xs font-bold text-muted px-1">
                  <span>{activeCapsule.title}</span>
                  <span>
                    {Math.min(focusIndex + 1, focusItems.length)} / {focusItems.length}
                  </span>
                </div>

                {/* Main Focus Card (Distraction-Free) */}
                {currentFocusItem ? (
                  <div className="relative rounded-2xl border border-purple/15 bg-gradient-to-b from-card to-background p-6 sm:p-8 min-h-64 flex flex-col justify-between shadow-sm transition-all duration-200">
                    <div className="space-y-4">
                      <span className="inline-flex rounded-full border border-purple/15 bg-purple/5 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-purple">
                        {currentFocusItem.label}
                      </span>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-black leading-relaxed text-foreground select-none">
                        {currentFocusItem.body}
                      </p>
                    </div>

                    {/* Round thumb-friendly slide navigation */}
                    <div className="flex gap-3 justify-end mt-6">
                      <button
                        type="button"
                        onClick={() =>
                          setFocusIndex((currentIndex) => Math.max(0, currentIndex - 1))
                        }
                        disabled={focusIndex === 0}
                        className="flex size-11 items-center justify-center rounded-full border border-border bg-card text-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm cursor-pointer"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFocusIndex((currentIndex) =>
                            Math.min(focusItems.length - 1, currentIndex + 1),
                          )
                        }
                        disabled={focusIndex >= focusItems.length - 1}
                        className="flex size-11 items-center justify-center rounded-full border border-border bg-card text-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm cursor-pointer"
                        aria-label="Next slide"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Context drawers (Deemphasized details at bottom) */}
                <div className="space-y-2.5">
                  <details className="group rounded-2xl border border-border bg-card p-4 transition-all">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-1 text-xs font-bold uppercase tracking-widest text-muted">
                      Original Notes Reference
                      <ChevronDown
                        size={16}
                        className="shrink-0 text-muted transition-transform group-open:rotate-180"
                      />
                    </summary>
                    <div className="mt-5 border-t border-border/60 pt-5">
                      <p className="text-xs font-semibold text-foreground">
                        {activeCapsule.subject}
                      </p>
                      <p className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap text-[11px] leading-relaxed text-muted">
                        {activeCapsule.content}
                      </p>
                    </div>
                  </details>

                  <details className="group rounded-2xl border border-border bg-card p-4 transition-all">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-1 text-xs font-bold uppercase tracking-widest text-muted">
                      Study Insights & Analytics
                      <ChevronDown
                        size={16}
                        className="shrink-0 text-muted transition-transform group-open:rotate-180"
                      />
                    </summary>
                    <div className="mt-5 border-t border-border/60 pt-5 grid gap-3">
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
                    </div>
                  </details>
                </div>

                {/* Sticky Bottom Active Session Bar */}
                <div className="fixed inset-x-0 bottom-20 z-40 px-5 sm:sticky sm:bottom-6 sm:px-0">
                  <div className="mx-auto max-w-md rounded-2xl border border-border bg-card/95 p-3.5 shadow-xl backdrop-blur-md flex items-center justify-between gap-4">
                    {isCapsuleSessionActive && activeSession ? (
                      <>
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-purple">
                            {activeSession.status === 'running' ? 'Focusing' : 'Paused'}
                          </p>
                          <p className="text-xl font-black tabular-nums tracking-tight text-foreground">
                            {elapsedDisplay}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {activeSession.status === 'running' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="min-h-10 text-xs px-3.5"
                              onClick={pauseSession}
                            >
                              Pause
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="min-h-10 text-xs px-3.5"
                              onClick={resumeSession}
                            >
                              Resume
                            </Button>
                          )}
                          <Button
                            variant="danger"
                            size="sm"
                            className="min-h-10 text-xs px-3.5 border-red-500/10 bg-red-500/5 hover:bg-red-500/10 text-red-500"
                            onClick={endSession}
                          >
                            Finish
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-muted leading-tight max-w-[200px]">
                          {hasOtherActiveSession
                            ? 'Finish active session elsewhere.'
                            : 'Ready to study this capsule.'}
                        </p>
                        <Button
                          onClick={() => handleResumeStudy(activeCapsule)}
                          disabled={!canStartSelectedCapsule || Boolean(activeSession)}
                          className="gap-1.5 min-h-10 text-xs px-4"
                          variant="secondary"
                        >
                          <Play size={13} fill="currentColor" />
                          Start Study Timer
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Empty State
              <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center shadow-sm space-y-4">
                <div className="mx-auto grid size-12 place-items-center rounded-xl border border-border bg-background text-muted">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Choose a capsule to study</h3>
                  <p className="mt-1 max-w-sm mx-auto text-xs leading-relaxed text-muted">
                    Study sessions are linked to saved capsules to log revision time automatically to history.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMode(capsules.length > 0 ? 'library' : 'create')}
                  >
                    {capsules.length > 0 ? 'Open Library' : 'Create Capsule'}
                  </Button>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
