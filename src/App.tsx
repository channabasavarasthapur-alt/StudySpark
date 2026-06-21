import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { ThemeToggle } from './components/ThemeToggle'
import DashboardPage from './pages/DashboardPage'
import ExamsPage from './pages/ExamsPage'
import StudyCapsulesPage from './pages/StudyCapsulesPage'
import SetupPage from './pages/SetupPage'
import { Button } from './components/ui/Button'
import { BentoCard } from './components/ui/BentoCard'
import { Dock } from './components/layout/Dock'
import type { View } from './types/navigation'
import { Sparkles, Brain, Zap, Clock, Trophy, MousePointer2, ArrowRight } from 'lucide-react'

const viewPaths: Record<View, string> = {
  landing: '/',
  dashboard: '/dashboard',
  capsules: '/capsules',
  exams: '/exams',
  setup: '/setup',
}

const pathViews: Record<string, View> = Object.fromEntries(
  Object.entries(viewPaths).map(([view, path]) => [path, view]),
) as Record<string, View>

function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const view = useMemo(() => pathViews[location.pathname] ?? 'landing', [location.pathname])

  const handleNavigate = (nextView: View) => {
    navigate(viewPaths[nextView])
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (view === 'dashboard') {
    return (
      <>
        <DashboardPage onNavigate={handleNavigate} />
        <Dock activeView={view} onNavigate={handleNavigate} />
      </>
    )
  }

  if (view === 'capsules') {
    return (
      <>
        <StudyCapsulesPage onNavigate={handleNavigate} />
        <Dock activeView={view} onNavigate={handleNavigate} />
      </>
    )
  }

  if (view === 'setup') {
    return (
      <>
        <SetupPage onNavigate={handleNavigate} />
        <Dock activeView={view} onNavigate={handleNavigate} />
      </>
    )
  }

  if (view === 'exams') {
    return (
      <>
        <ExamsPage onNavigate={handleNavigate} />
        <Dock activeView={view} onNavigate={handleNavigate} />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* Premium Navbar */}
      <nav
        className={`fixed inset-x-0 top-0 z-50 flex h-20 items-center transition-colors duration-200 ${
          scrolled ? 'border-b border-border bg-background' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-foreground text-background font-black">S</div>
            <span className="text-xl font-bold tracking-tight">StudySpark</span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={() => handleNavigate('dashboard')}>
              Log in
            </Button>
            <Button size="sm" onClick={() => handleNavigate('dashboard')}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative pt-20">
        {/* Hero Section */}
        <section className="relative mx-auto max-w-7xl px-6 py-20 text-center lg:py-28">
          <div className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 shadow-sm">
            <Sparkles size={14} className="text-purple" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Structured study workspace</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Build better study habits with <span className="text-gradient">clearer structure.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg text-muted sm:text-xl leading-8 smart-board-text">
            StudySpark turns notes, sessions, and revision history into a focused learning system students can understand and teachers can trust.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" onClick={() => handleNavigate('dashboard')} className="w-full sm:w-auto">
              Start Studying for Free
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto group">
              See how it works
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-3 transition-opacity duration-700">
            {['Study Sessions', 'Capsules', 'Exam Prep', 'Progress Tracking', 'Daily Revision'].map((tag) => (
              <span key={tag} className="text-xs font-semibold tracking-wider uppercase border border-border px-3 py-1 rounded-lg bg-card text-muted shadow-sm">{tag}</span>
            ))}
          </div>
        </section>

        {/* Bento Showcase */}
        <section className="mx-auto max-w-7xl px-6 py-20 lg:py-32">
          <div className="mb-16 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl">A calmer way to manage <br />serious study.</h2>
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
                <div className="rounded-2xl border border-border bg-background/50 p-4">
                  <div className="h-2 w-1/2 rounded-full bg-purple/30 mb-2" />
                  <div className="h-2 w-3/4 rounded-full bg-foreground/10" />
                </div>
                <div className="rounded-2xl border border-border bg-background/50 p-4">
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
                    className="flex-1 rounded-t-lg bg-teal transition-[height] duration-500"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </BentoCard>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-7xl px-6 py-32 text-center">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-8 py-20 shadow-sm sm:px-16">
            <div className="relative z-10">
              <h2 className="text-4xl font-extrabold sm:text-5xl">Prepare with evidence, not guesswork.</h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
                Track focused sessions, organize capsules, and build a revision history that makes progress visible.
              </p>
              <Button size="lg" onClick={() => handleNavigate('dashboard')} className="mt-10">
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />} />
      <Route path="/dashboard" element={<AppShell />} />
      <Route path="/capsules" element={<AppShell />} />
      <Route path="/exams" element={<AppShell />} />
      <Route path="/setup" element={<AppShell />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
