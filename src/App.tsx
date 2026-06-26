import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { ThemeToggle } from './components/ThemeToggle'
import { ProtectedRoute, PublicOnlyRoute } from './components/auth/AuthGate'
import DashboardPage from './pages/DashboardPage'
import ExamsPage from './pages/ExamsPage'
import StudyCapsulesPage from './pages/StudyCapsulesPage'
import SetupPage from './pages/SetupPage'
import AuthPage from './pages/AuthPage'
import { Button } from './components/ui/Button'
import { Dock } from './components/layout/Dock'
import type { View } from './types/navigation'
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileText,
  GraduationCap,
  Play,
  Sparkles,
  Target,
} from 'lucide-react'

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

  const handleDemoScroll = () => {
    document.getElementById('product-demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
      <nav
        className={`fixed inset-x-0 top-0 z-50 flex h-20 items-center transition-colors duration-200 ${
          scrolled ? 'border-b border-border bg-background/95 backdrop-blur' : 'bg-background/80 backdrop-blur'
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-foreground text-background font-black">S</div>
            <span className="text-xl font-bold tracking-tight">StudySpark</span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="hidden sm:inline-flex">
              Log In
            </Button>
            <Button size="sm" onClick={() => handleNavigate('setup')}>
              Start Studying
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative pt-20">
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-16 pt-12 lg:grid-cols-[0.9fr_1.1fr] lg:pb-24 lg:pt-20">
          <div>
            <div className="mb-6 flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
              <Sparkles size={16} className="text-purple" />
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Notes to exam readiness</span>
            </div>

            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl">
              Turn messy class notes into a study plan you can actually follow.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              Paste what you learned today. StudySpark shapes it into an AI capsule, starts focused practice, and shows what is left before the exam.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={() => handleNavigate('setup')} className="w-full sm:w-auto">
                Create My Study Plan
                <ArrowRight size={18} />
              </Button>
              <Button variant="outline" size="lg" onClick={handleDemoScroll} className="w-full sm:w-auto">
                <Play size={18} />
                See Demo
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['Notes', FileText],
                ['AI Capsule', Sparkles],
                ['Study', BookOpenCheck],
                ['Exam Ready', GraduationCap],
              ].map(([label, Icon], index) => (
                <div key={label as string} className="rounded-lg border border-border bg-card p-3 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <Icon size={18} className={index === 1 ? 'text-purple' : index === 3 ? 'text-teal' : 'text-muted'} />
                    <span className="text-xs font-bold text-muted">{index + 1}</span>
                  </div>
                  <p className="text-sm font-bold text-foreground">{label as string}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="product-demo" className="scroll-mt-28 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple">Live product flow</p>
                <h2 className="mt-1 text-xl font-extrabold tracking-tight">Biology revision capsule</h2>
              </div>
              <div className="rounded-lg bg-teal/10 px-3 py-2 text-sm font-black text-teal">82% ready</div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-lg border border-border bg-background/70 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-muted" />
                  <p className="text-sm font-bold">Pasted notes</p>
                </div>
                <div className="space-y-3 text-sm leading-6 text-muted">
                  <p className="rounded-lg bg-card p-3 shadow-sm">Photosynthesis uses light energy to make glucose in chloroplasts.</p>
                  <p className="rounded-lg bg-card p-3 shadow-sm">Light reaction splits water, releases oxygen, and makes ATP.</p>
                  <p className="rounded-lg bg-card p-3 shadow-sm">Calvin cycle uses carbon dioxide to build sugars.</p>
                </div>
              </div>

              <div className="rounded-lg border border-purple/20 bg-purple/5 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles size={18} className="text-purple" />
                  <p className="text-sm font-bold">AI capsule</p>
                </div>
                <h3 className="text-lg font-extrabold tracking-tight">Photosynthesis in 12 minutes</h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-foreground">
                  {[
                    'Core idea: light energy becomes chemical energy.',
                    'Must know: chloroplast, ATP, glucose, oxygen.',
                    'Practice next: label the two-stage process.',
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle2 size={17} className="mt-1 shrink-0 text-teal" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-border bg-background/70 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Clock size={18} className="text-purple" />
                  <p className="text-sm font-bold">Study block</p>
                </div>
                <p className="text-3xl font-black tabular-nums">12:00</p>
                <p className="mt-1 text-sm text-muted">Capsule review plus recall prompt</p>
              </div>

              <div className="rounded-lg border border-border bg-background/70 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Target size={18} className="text-purple" />
                  <p className="text-sm font-bold">Next question</p>
                </div>
                <p className="text-sm leading-6 text-muted">Explain why oxygen is released during the light reaction.</p>
              </div>

              <div className="rounded-lg border border-border bg-background/70 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <ClipboardCheck size={18} className="text-teal" />
                  <p className="text-sm font-bold">Exam ready</p>
                </div>
                <div className="h-2 rounded-full bg-border">
                  <div className="h-2 w-[82%] rounded-full bg-teal" />
                </div>
                <p className="mt-3 text-sm text-muted">3 weak topics left</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-card/60 px-6 py-14">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple">The transformation</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">From scattered notes to clear next steps.</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted">
                Students do not need another dashboard to manage. They need to know what to read, what to recall, and what still needs work.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['Before', 'Loose notes, screenshots, and half-finished revision lists.'],
                ['StudySpark', 'Capsules group the ideas and turn them into short study actions.'],
                ['After', 'A visible readiness score and a focused plan for the next session.'],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-lg border border-border bg-background p-5 shadow-sm">
                  <p className="text-sm font-extrabold text-foreground">{title}</p>
                  <p className="mt-3 text-sm leading-6 text-muted">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-8 rounded-lg border border-border bg-card p-6 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center lg:p-8">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">Ready to turn today's notes into today's study session?</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
                Set your subjects, exam date, and available study time. StudySpark will help organize the rest.
              </p>
            </div>
            <Button size="lg" onClick={() => handleNavigate('setup')} className="w-full sm:w-auto">
              Create My Study Plan
              <ArrowRight size={18} />
            </Button>
          </div>
        </section>

        <footer className="border-t border-border px-6 py-10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background font-black text-sm">S</div>
              <span className="text-sm font-bold tracking-tight">StudySpark</span>
            </div>
            <p className="text-center text-xs text-muted md:text-right">Built for students turning class material into exam confidence.</p>
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
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <AuthPage mode="login" />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <AuthPage mode="signup" />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      />
      <Route
        path="/capsules"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exams"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      />
      <Route
        path="/setup"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
