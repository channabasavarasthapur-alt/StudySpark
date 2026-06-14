import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { ThemeToggle } from '../components/ThemeToggle'
import { CapsuleCard } from '../components/capsules/CapsuleCard'
import { InsightCard } from '../components/capsules/InsightCard'
import { SubjectCard } from '../components/capsules/SubjectCard'
import {
  Sparkles,
  Brain,
  Zap,
  Atom,
  Loader2,
  BookOpen,
  ArrowLeft,
  Calculator,
  FlaskConical,
  Dna,
  BarChart3,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import type { View } from '../types/navigation'

interface StudyCapsulesPageProps {
  onNavigate: (view: View) => void
}

export default function StudyCapsulesPage({ onNavigate }: StudyCapsulesPageProps) {
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [showCapsule, setShowCapsule] = useState(false)

  const loadingMessages = [
    "Reading your notes...",
    "Finding key concepts...",
    "Making main points...",
    "Organizing formulas...",
    "Almost done..."
  ]

  const handleGenerate = () => {
    if (!input.trim()) return
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
      {/* Header */}
      <header className="mx-auto max-w-7xl px-6 pt-8 lg:pt-12 text-center">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')} className="gap-2">
            <ArrowLeft size={16} />
            Back
          </Button>
          <ThemeToggle />
        </div>
        <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-purple/20 bg-purple/5 px-4 py-1.5 backdrop-blur-md">
          <Sparkles size={14} className="text-purple" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-purple">Smart Study v1.0</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
          Make a <button className="text-gradient hover:opacity-80 transition-opacity cursor-pointer" onClick={() => onNavigate('dashboard')}>Capsule.</button>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted/80 font-medium">
          Paste your notes or book chapters. We'll help you get the main points in a neat study format.
        </p>
      </header>

      <main className="mx-auto mt-16 max-w-5xl px-6">
        {/* Magic Input Area */}
        <section className="relative">
          <div className="glass-morphism relative overflow-hidden rounded-[2.5rem] p-2">
             <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your source material (notes, transcript, or article)..."
                className="h-64 w-full resize-none rounded-[2rem] border border-border/80 bg-background/50 p-8 text-xl leading-relaxed text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-purple/20 transition-all"
              />

              <div className="flex items-center justify-between p-4 px-8">
                <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-muted">
                  <span>{input.length} Characters</span>
                  <span>{Math.ceil(input.length / 500)}m Read</span>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!input.trim() || isGenerating}
                  className="gap-2 px-8"
                  variant="secondary"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Zap size={18} fill="currentColor" />
                      Make Capsule
                    </>
                  )}
                </Button>
              </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -left-12 -top-12 -z-10 size-48 rounded-full bg-purple/10 blur-3xl animate-pulse-slow" />
          <div className="absolute -right-12 -bottom-12 -z-10 size-48 rounded-full bg-teal/10 blur-3xl animate-pulse-slow delay-700" />
        </section>

        {/* Results Section */}
        <div className="mt-20 space-y-24 min-h-[400px]">
          {!showCapsule && !isGenerating && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-1000">
               <div className="relative mb-8">
                  <div className="absolute inset-0 scale-150 bg-purple/5 blur-3xl rounded-full" />
                  <div className="relative flex size-24 items-center justify-center rounded-[2rem] border border-border bg-card/50 backdrop-blur-sm shadow-2xl">
                    <BookOpen size={40} className="text-muted/40" />
                  </div>
               </div>
               <h3 className="text-xl font-bold text-foreground/40">Ready to Start</h3>
               <p className="mt-2 max-w-xs text-sm font-medium text-muted/60 leading-relaxed uppercase tracking-widest">Your neat study notes will appear here once you press "Make Capsule".</p>
            </div>
          )}

          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in fade-in duration-500">
               <div className="relative flex size-24 items-center justify-center">
                  <div className="absolute inset-0 animate-spin rounded-full border-b-2 border-purple" />
                  <div className="absolute inset-2 animate-[spin_3s_linear_infinite_reverse] rounded-full border-t-2 border-teal" />
                  <Sparkles size={32} className="text-purple animate-pulse" />
               </div>
               <div className="text-center">
                  <div className="mx-auto mb-4 h-1 w-48 overflow-hidden rounded-full bg-muted/10">
                    <div className="h-full bg-gradient-to-r from-purple to-teal transition-all duration-500 ease-out" style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }} />
                  </div>
                  <p className="text-xs font-black text-purple uppercase tracking-[0.3em] animate-pulse">
                    {loadingMessages[loadingStep]}
                  </p>
               </div>
            </div>
          )}

          {showCapsule && (
            <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
              <div className="grid gap-12 md:grid-cols-12">
                <div className="md:col-span-8">
                  <h2 className="mb-6 px-2 text-2xl font-black tracking-tight">The Capsule</h2>
                  <CapsuleCard
                    topic="[Sample] Quantum Entanglement"
                    summary="This is a sample synthesis generated from mock physics notes. Particles become interconnected such that their states are correlated regardless of distance."
                    concepts={["Bell's Theorem", "Wave Collapse", "Qubits"]}
                    formulas={["|ψ⟩ = α|0⟩ + β|1⟩", "E = hν"]}
                    tips={["Example tip: Visualize the Bloch sphere.", "Example tip: Observe entanglement constraints."]}
                    time="25m"
                    difficulty="Hard"
                    icon={Atom}
                  />
                </div>

                <div className="md:col-span-4">
                  <div className="rounded-3xl border border-border/40 bg-muted/5 p-6">
                    <h2 className="mb-6 px-2 text-2xl font-black tracking-tight">Insights</h2>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
                      <InsightCard
                        label="Study Score"
                        value="--"
                        icon={Brain}
                        description="Score will show after you start studying."
                        color="purple"
                        progress={0}
                      />
                      <InsightCard
                        label="Understanding"
                        value="High"
                        icon={BarChart3}
                        description="You've understood the main points."
                        color="teal"
                        progress={88}
                      />
                      <InsightCard
                        label="Revision"
                        value="Low"
                        icon={AlertCircle}
                        description="No need to revise immediately."
                        color="teal"
                        progress={12}
                      />
                      <InsightCard
                        label="Status"
                        value="Saved"
                        icon={CheckCircle2}
                        description="Capsule added to your library."
                        color="purple"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Capsules Section */}
          <section className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            <div className="mb-8 flex items-center justify-between px-2">
              <h2 className="text-2xl font-black tracking-tight">Recent Capsules</h2>
              <Button variant="ghost" size="sm" className="text-purple uppercase font-black tracking-widest text-[10px]">View Library</Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <SubjectCard
                subject="Mathematics"
                icon={Calculator}
                lastStudied="Not yet"
                progress={0}
                streak={0}
                color="purple"
              />
              <SubjectCard
                subject="Physics"
                icon={Atom}
                lastStudied="Not yet"
                progress={0}
                streak={0}
                color="teal"
              />
              <SubjectCard
                subject="Chemistry"
                icon={FlaskConical}
                lastStudied="Not yet"
                progress={0}
                streak={0}
                color="purple"
              />
              <SubjectCard
                subject="Biology"
                icon={Dna}
                lastStudied="Not yet"
                progress={0}
                streak={0}
                color="teal"
              />
            </div>
          </section>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 30%; margin-left: 35%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}} />
    </div>
  )
}
