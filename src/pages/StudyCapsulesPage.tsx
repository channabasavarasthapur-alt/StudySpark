import { useState } from 'react'
import { Sidebar } from '../components/dashboard/Sidebar'
import { CapsuleCard } from '../components/capsules/CapsuleCard'
import { InsightCard } from '../components/capsules/InsightCard'
import { ProgressCard } from '../components/capsules/ProgressCard'
import { SubjectCard } from '../components/capsules/SubjectCard'
import {
  Sparkles,
  Brain,
  Target,
  Zap,
  Atom,
  Calculator,
  Beaker,
  Dna,
  History,
  Send,
  Loader2,
  ArrowRight
} from 'lucide-react'

interface StudyCapsulesPageProps {
  onBack: () => void
  onNavigate: (view: 'landing' | 'dashboard' | 'capsules') => void
}

const mockRecentSubjects = [
  { subject: 'Mathematics', icon: Calculator, lastStudied: '2 hours ago', progress: 85, streak: 12, color: 'purple' as const },
  { subject: 'Physics', icon: Atom, lastStudied: 'Yesterday', progress: 64, streak: 7, color: 'teal' as const },
  { subject: 'Chemistry', icon: Beaker, lastStudied: '3 days ago', progress: 42, streak: 4, color: 'purple' as const },
  { subject: 'Biology', icon: Dna, lastStudied: '1 week ago', progress: 92, streak: 15, color: 'teal' as const },
]

const mockGeneratedCapsule = {
  topic: "Quantum Entanglement & Superposition",
  summary: "A fundamental principle of quantum mechanics where particles become interconnected such that the state of one instantly influences the other, regardless of distance. Superposition allows particles to exist in multiple states simultaneously until measured.",
  concepts: [
    "Bell's Theorem & Non-locality",
    "Wave Function Collapse",
    "Quantum Bits (Qubits) in Computing",
    "EPR Paradox (Einstein-Podolsky-Rosen)"
  ],
  formulas: [
    "|ψ⟩ = α|0⟩ + β|1⟩",
    "P(state) = |⟨state|ψ⟩|²"
  ],
  tips: [
    "Visualize the Bloch Sphere for superposition states.",
    "Remember that entanglement does not allow for faster-than-light communication.",
    "Practice calculating probability amplitudes for 2-qubit systems."
  ],
  time: "25 min session",
  difficulty: "Hard" as const,
  icon: Atom
}

export default function StudyCapsulesPage({ onBack, onNavigate }: StudyCapsulesPageProps) {
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showCapsule, setShowCapsule] = useState(false)
  const charCount = input.length

  const handleGenerate = () => {
    if (!input.trim()) return

    setIsGenerating(true)
    setShowCapsule(false)

    // Simulate generation delay
    setTimeout(() => {
      setIsGenerating(false)
      setShowCapsule(true)
      // Scroll to result
      window.scrollTo({ top: 800, behavior: 'smooth' })
    }, 2500)
  }

  return (
    <div className="min-h-screen bg-background text-foreground lg:pl-64">
      <Sidebar onBack={onBack} onNavigate={onNavigate} activeItem="Study Capsules" />

      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        {/* Hero Section */}
        <header className="relative mb-20 text-center">
          <div className="absolute left-1/2 top-0 -z-10 h-64 w-full -translate-x-1/2 rounded-full bg-purple/10 blur-[120px]" />
          <div className="absolute right-0 top-20 -z-10 h-64 w-64 rounded-full bg-teal/10 blur-[100px]" />

          <div className="inline-flex items-center gap-2 rounded-full border border-purple/20 bg-purple/5 px-4 py-1.5 text-sm font-bold text-purple mb-6">
            <Sparkles size={16} />
            <span>Introducing Study Capsules V1</span>
          </div>

          <h1 className="text-5xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Turn Notes Into <span className="bg-gradient-to-r from-purple to-teal bg-clip-text text-transparent">Smart Study Capsules</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-muted">
            Our intelligent engine distills your complex notes into focused, high-impact learning blocks designed for maximum retention.
          </p>
        </header>

        {/* Capsule Creator */}
        <section className="mb-24">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-purple to-teal opacity-20 blur-xl transition duration-1000 group-hover:opacity-30 group-hover:duration-200" />
            <div className="relative rounded-[2rem] border border-border bg-card/80 p-6 backdrop-blur-xl sm:p-10">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your notes, chapter content, or class material here..."
                className="h-64 w-full resize-none bg-transparent text-xl leading-relaxed text-foreground placeholder:text-muted/50 focus:outline-none"
              />

              <div className="mt-8 flex flex-col items-center justify-between gap-6 border-t border-border pt-8 sm:flex-row">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted">Characters</span>
                    <span className="text-lg font-black text-foreground">{charCount.toLocaleString()}</span>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted">Est. Study Time</span>
                    <span className="text-lg font-black text-foreground">{Math.ceil(charCount / 500) || 0} min</span>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!input.trim() || isGenerating}
                  className="group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-purple px-10 py-4 text-lg font-black text-white shadow-2xl shadow-purple/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      Synthesizing...
                    </>
                  ) : (
                    <>
                      <Zap size={24} fill="currentColor" />
                      Generate Capsule
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite]" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Generated Content Area */}
        <section id="result-area" className="mb-24 min-h-[400px]">
          {!showCapsule && !isGenerating && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 animate-pulse rounded-full bg-purple/20 blur-3xl" />
                <div className="relative grid size-24 place-items-center rounded-3xl border border-border bg-card shadow-inner">
                  <History size={40} className="text-muted" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-foreground">Ready to start?</h3>
              <p className="mt-3 max-w-md text-muted">
                Your generated study capsules will appear here. Paste some notes above to see the magic happen.
              </p>
              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => setInput("Photosynthesis is a process used by plants and other organisms to convert light energy into chemical energy that, through cellular respiration, can later be released to fuel the organism's activities.")}
                  className="text-sm font-bold text-purple hover:underline"
                >
                  Try an example
                </button>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative mb-10">
                <div className="size-20 rounded-full border-4 border-purple/20 border-t-purple animate-spin" />
                <Brain className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-purple animate-pulse" size={32} />
              </div>
              <h3 className="text-2xl font-black text-foreground">AI is processing your material</h3>
              <p className="mt-2 text-muted">Identifying key concepts and optimizing for recall...</p>

              <div className="mt-10 w-full max-w-md space-y-4">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted/10">
                  <div className="h-full bg-purple animate-[progress_2s_ease-in-out_infinite]" />
                </div>
              </div>
            </div>
          )}

          {showCapsule && (
            <div className="grid gap-10 lg:grid-cols-[1fr_350px] animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black text-foreground">Generated Capsule</h2>
                  <button className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold transition hover:border-purple/50">
                    <Send size={16} className="text-purple" />
                    Save to Library
                  </button>
                </div>

                <CapsuleCard {...mockGeneratedCapsule} />
              </div>

              <div className="space-y-8">
                <h2 className="text-3xl font-black text-foreground">Insights</h2>
                <div className="space-y-6">
                  <InsightCard
                    label="Focus Score"
                    value="94/100"
                    icon={Target}
                    description="This material is highly optimized for deep focus sessions."
                    color="purple"
                  />
                  <InsightCard
                    label="Complexity"
                    value="Advanced"
                    icon={Brain}
                    description="Requires significant cognitive load. Recommended for morning study."
                    color="teal"
                  />

                  <div className="rounded-2xl border border-border bg-card p-8">
                    <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-muted">Status Overview</h4>
                    <div className="space-y-6">
                      <ProgressCard
                        label="Understanding"
                        percentage={72}
                        status="Solid foundation"
                        color="purple"
                      />
                      <ProgressCard
                        label="Retention"
                        percentage={45}
                        status="Needs more recall"
                        color="teal"
                      />
                      <ProgressCard
                        label="Revision Priority"
                        percentage={88}
                        status="High Priority"
                        color="purple"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Recent Capsules */}
        <section className="mb-20">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-foreground">Recent History</h2>
              <p className="mt-2 text-muted">Continue where you left off</p>
            </div>
            <button className="flex items-center gap-2 font-bold text-purple hover:gap-3 transition-all">
              View full library
              <ArrowRight size={20} />
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {mockRecentSubjects.map((subject) => (
              <SubjectCard key={subject.subject} {...subject} />
            ))}
          </div>
        </section>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes progress {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 40%; margin-left: 30%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}} />
    </div>
  )
}
