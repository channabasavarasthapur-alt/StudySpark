import { useState, useEffect } from 'react'
import { ThemeToggle } from './components/ThemeToggle'
import DashboardPage from './pages/DashboardPage'
import StudyCapsulesPage from './pages/StudyCapsulesPage'
import { Button } from './components/ui/Button'
import { BentoCard } from './components/ui/BentoCard'
import { Dock } from './components/layout/Dock'
import type { View } from './types/navigation'
import { Sparkles, Brain, Zap, Clock, Trophy, MousePointer2, ArrowRight } from 'lucide-react'

function App() {
  const [view, setView] = useState<View>('landing')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (view === 'dashboard') {
    return (
      <>
        <DashboardPage onNavigate={setView} />
        <Dock activeView={view} onNavigate={setView} />
      </>
    )
  }

  if (view === 'capsules') {
    return (
      <>
        <StudyCapsulesPage onNavigate={setView} />
        <Dock activeView={view} onNavigate={setView} />
      </>
    )
  }

  if (view === 'exams' || view === 'setup') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h2 className="text-3xl font-black uppercase tracking-tighter sm:text-5xl">Coming Soon</h2>
          <p className="mt-4 text-muted">This module is under development for V1.1</p>
          <Button className="mt-8" onClick={() => setView('dashboard')}>Back to Dashboard</Button>
        </div>
        <Dock activeView={view} onNavigate={setView} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* Premium Navbar */}
      <nav
        className={`fixed inset-x-0 top-0 z-50 flex h-20 items-center transition-all duration-300 ${
          scrolled ? 'border-b border-border bg-background/80 backdrop-blur-xl' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-foreground text-background font-black">S</div>
            <span className="text-xl font-bold tracking-tight">StudySpark</span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={() => setView('dashboard')}>
              Log in
            </Button>
            <Button size="sm" onClick={() => setView('dashboard')}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative pt-20">
        {/* Background Gradients */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 left-1/4 size-[500px] rounded-full bg-purple/10 blur-[120px]" />
          <div className="absolute top-1/2 right-1/4 size-[400px] rounded-full bg-teal/5 blur-[100px]" />
        </div>

        {/* Hero Section */}
        <section className="relative mx-auto max-w-7xl px-6 py-24 text-center lg:py-32">
          <div className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 backdrop-blur-md">
            <Sparkles size={14} className="text-purple" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted">Beta Version - Try it now</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl lg:text-8xl">
            Finish your syllabus <br />
            <span className="text-gradient">much faster.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg text-muted/80 sm:text-xl leading-relaxed font-medium smart-board-text">
            Don't just read, actually remember. StudySpark turns your messy notes into neat capsules so you can focus and study better.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" onClick={() => setView('dashboard')} className="w-full sm:w-auto">
              Start Studying for Free
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto group">
              See how it works
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="mt-20 flex flex-wrap justify-center gap-8 opacity-40 transition-opacity duration-700">
            {['Purpose-built for', 'Self-Learners', 'Exam Prep', 'Research', 'Daily Revision'].map((tag) => (
              <span key={tag} className="text-xs font-bold tracking-widest uppercase border border-border px-3 py-1 rounded-lg bg-card/30">{tag}</span>
            ))}
          </div>
        </section>

        {/* Bento Showcase */}
        <section className="mx-auto max-w-7xl px-6 py-20 lg:py-32">
          <div className="mb-16 text-center lg:text-left">
            <h2 className="text-3xl font-black sm:text-4xl lg:text-5xl">Everything you need <br />to ace your exams.</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-12 md:grid-rows-2">
            <BentoCard
              className="md:col-span-8"
              title="Study Capsules"
              description="Get quick summaries and main points from any of your notes."
              icon={<Brain size={20} />}
              badge="Main Feature"
            >
              <div className="mt-8 grid grid-cols-2 gap-4 overflow-hidden">
                <div className="rounded-2xl border border-border bg-background/50 p-4 animate-float">
                  <div className="h-2 w-1/2 rounded-full bg-purple/30 mb-2" />
                  <div className="h-2 w-3/4 rounded-full bg-foreground/10" />
                </div>
                <div className="rounded-2xl border border-border bg-background/50 p-4 delay-150 animate-float">
                  <div className="h-2 w-1/3 rounded-full bg-teal/30 mb-2" />
                  <div className="h-2 w-2/3 rounded-full bg-foreground/10" />
                </div>
              </div>
            </BentoCard>

            <BentoCard
              className="md:col-span-4"
              title="Quick Flashcards"
              description="Make revision cards from your notes in a second."
              icon={<Zap size={20} />}
            >
              <div className="mt-8 flex justify-center">
                <div className="relative size-24 rounded-2xl border-2 border-dashed border-border flex items-center justify-center">
                  <MousePointer2 size={20} className="text-muted" />
                </div>
              </div>
            </BentoCard>

            <BentoCard
              className="md:col-span-4"
              title="Study Timer"
              description="Focus better with timers made for your tasks."
              icon={<Clock size={20} />}
            >
              <div className="mt-8 text-center">
                <span className="text-4xl font-black tabular-nums">25:00</span>
              </div>
            </BentoCard>

            <BentoCard
              className="md:col-span-8"
              title="Track your Progress"
              description="See how much you've studied and stay motivated to finish."
              icon={<Trophy size={20} />}
              badge="Motivation"
            >
              <div className="mt-8 flex items-end gap-2 h-20">
                {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-purple to-teal rounded-t-lg transition-all duration-500 hover:opacity-80"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </BentoCard>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-7xl px-6 py-32 text-center">
          <div className="glass-morphism relative overflow-hidden rounded-[3rem] px-8 py-20 sm:px-16">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple/10 via-transparent to-teal/10" />
            <div className="relative z-10">
              <h2 className="text-4xl font-black sm:text-6xl">Ace your next exam.</h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
                Join other students who are finishing their syllabus faster and remembering more.
              </p>
              <Button size="lg" onClick={() => setView('dashboard')} className="mt-10">
                Join for Free
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-12 px-6">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background font-black text-sm">S</div>
              <span className="text-sm font-bold tracking-tight">StudySpark</span>
            </div>
            <p className="text-xs text-muted">(c) 2024 StudySpark. Built for students.</p>
            <div className="flex gap-6 text-xs font-bold uppercase tracking-widest text-muted">
              <a href="#" className="hover:text-foreground">Twitter</a>
              <a href="#" className="hover:text-foreground">Discord</a>
              <a href="#" className="hover:text-foreground">Privacy</a>
            </div>
          </div>
        </footer>
      </main>

    </div>
  )
}

export default App
