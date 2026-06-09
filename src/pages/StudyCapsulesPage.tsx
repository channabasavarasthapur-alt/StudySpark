import { useState } from 'react'
import { BentoCard } from '../components/ui/BentoCard'
import { Button } from '../components/ui/Button'
import { ThemeToggle } from '../components/ThemeToggle'
import {
  Sparkles,
  Brain,
  Zap,
  Atom,
  Loader2,
  Save,
  MessageSquare,
  BookOpen,
  Target,
  Clock
} from 'lucide-react'
import type { View } from '../types/navigation'

interface StudyCapsulesPageProps {
  onNavigate: (view: View) => void
}

export default function StudyCapsulesPage({ onNavigate }: StudyCapsulesPageProps) {
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showCapsule, setShowCapsule] = useState(false)

  const handleGenerate = () => {
    if (!input.trim()) return
    setIsGenerating(true)
    setShowCapsule(false)
    setTimeout(() => {
      setIsGenerating(false)
      setShowCapsule(true)
      window.scrollTo({ top: 500, behavior: 'smooth' })
    }, 2500)
  }

  return (
    <div className="min-h-screen bg-background pb-32 transition-colors duration-500">
      {/* Header */}
      <header className="mx-auto max-w-7xl px-6 pt-12 lg:pt-16 text-center">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-purple/20 bg-purple/5 px-4 py-1.5 backdrop-blur-md">
          <Sparkles size={14} className="text-purple" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-purple">AI Synthesis v1.0</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
          Create a <button className="text-gradient hover:opacity-80 transition-opacity cursor-pointer" onClick={() => onNavigate('dashboard')}>Capsule.</button>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
          Paste your notes or a link. We'll distill it into a high-octane study session.
        </p>
      </header>

      <main className="mx-auto mt-16 max-w-5xl px-6">
        {/* Magic Input Area */}
        <section className="relative">
          <div className="glass-morphism relative overflow-hidden rounded-[2.5rem] p-2">
             <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Drop your knowledge here..."
                className="h-64 w-full resize-none rounded-[2rem] bg-background/50 p-8 text-xl leading-relaxed text-foreground placeholder:text-muted/30 focus:outline-none"
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
                      Synthesize
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
        <div className="mt-20 space-y-12">
          {!showCapsule && !isGenerating && (
            <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
               <div className="mb-6 flex size-20 items-center justify-center rounded-3xl border border-border bg-card">
                  <BookOpen size={32} className="text-muted" />
               </div>
               <p className="font-bold text-muted uppercase tracking-widest text-xs">Waiting for your notes</p>
            </div>
          )}

          {isGenerating && (
            <div className="space-y-8 py-12">
               <div className="mx-auto h-1 w-full max-w-md overflow-hidden rounded-full bg-muted/10">
                  <div className="h-full bg-purple animate-[progress_2s_ease-in-out_infinite]" />
               </div>
               <p className="text-center font-bold text-purple uppercase tracking-widest text-xs animate-pulse">Analyzing structures & core concepts</p>
            </div>
          )}

          {showCapsule && (
            <div className="grid gap-8 md:grid-cols-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
              <div className="md:col-span-8 space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-2xl font-black tracking-tight">The Capsule</h2>
                  <div className="flex gap-2">
                    <Button variant="glass" size="sm" className="gap-2">
                      <Save size={14} />
                      Library
                    </Button>
                    <Button variant="glass" size="sm" className="gap-2">
                      <MessageSquare size={14} />
                      Ask AI
                    </Button>
                  </div>
                </div>

                <div className="glass-morphism overflow-hidden rounded-[2.5rem] bg-card/30 p-10 bento-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded-full bg-purple/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-purple">Quantum Physics</span>
                      <h3 className="mt-4 text-3xl font-black leading-tight">Quantum Entanglement & Superposition</h3>
                    </div>
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-foreground text-background">
                      <Atom size={28} />
                    </div>
                  </div>

                  <p className="mt-8 text-lg leading-relaxed text-muted">
                    A fundamental principle of quantum mechanics where particles become interconnected such that the state of one instantly influences the other, regardless of distance.
                  </p>

                  <div className="mt-12 grid gap-8 sm:grid-cols-2">
                    <div className="space-y-4">
                      <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-foreground">
                        <Target size={14} className="text-purple" />
                        Key Concepts
                      </h4>
                      <ul className="space-y-3">
                        {["Bell's Theorem", "Wave Collapse", "Qubits"].map(item => (
                          <li key={item} className="flex items-center gap-3 text-sm font-medium text-muted">
                            <span className="size-1.5 rounded-full bg-purple" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-foreground">
                        <Zap size={14} className="text-teal" />
                        Quick Logic
                      </h4>
                      <div className="rounded-2xl bg-foreground/5 p-4 font-mono text-xs text-muted">
                        |ψ⟩ = α|0⟩ + β|1⟩
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 space-y-6">
                <h2 className="text-2xl font-black tracking-tight px-2">Insights</h2>

                <BentoCard title="Focus Score" icon={<Brain size={18} />} className="bg-purple/5 border-purple/20">
                  <div className="text-4xl font-black text-purple">94%</div>
                  <p className="mt-2 text-xs text-muted leading-relaxed">Optimal for deep work.</p>
                </BentoCard>

                <BentoCard title="Est. Time" icon={<Clock size={18} />}>
                  <div className="text-4xl font-black">25m</div>
                  <p className="mt-2 text-xs text-muted">Intense recall session.</p>
                </BentoCard>

                <div className="glass-morphism rounded-3xl p-6">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-4">Revision Curve</h4>
                   <div className="h-2 rounded-full bg-foreground/5 overflow-hidden">
                      <div className="h-full w-[72%] bg-gradient-to-r from-purple to-teal" />
                   </div>
                   <div className="mt-2 flex justify-between text-[10px] font-bold text-muted">
                      <span>Retention</span>
                      <span>72%</span>
                   </div>
                </div>
              </div>
            </div>
          )}
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
