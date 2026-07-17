import { Fragment, useEffect, useMemo, useState, lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { ThemeToggle } from './components/ThemeToggle'
import { ProtectedRoute, PublicOnlyRoute } from './components/auth/AuthGate'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ExamsPage = lazy(() => import('./pages/ExamsPage'))
const StudyCapsulesPage = lazy(() => import('./pages/StudyCapsulesPage'))
const SetupPage = lazy(() => import('./pages/SetupPage'))
const TutorPage = lazy(() => import('./pages/TutorPage'))
const AuthPage = lazy(() => import('./pages/AuthPage'))
import { Button } from './components/ui/Button'
import { Dock } from './components/layout/Dock'
import type { View } from './types/navigation'
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  GraduationCap,
  Sparkles,
} from 'lucide-react'

const viewPaths: Record<View, string> = {
  landing: '/',
  dashboard: '/dashboard',
  capsules: '/capsules',
  exams: '/exams',
  setup: '/setup',
  tutor: '/tutor',
}

const pathViews: Record<string, View> = Object.fromEntries(
  Object.entries(viewPaths).map(([view, path]) => [path, view]),
) as Record<string, View>

function PageLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-background text-foreground transition-colors duration-500">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-purple" />
        <p className="text-xs font-semibold text-muted">Loading page...</p>
      </div>
    </div>
  )
}

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
      <Suspense fallback={<PageLoading />}>
        <DashboardPage onNavigate={handleNavigate} />
        <Dock activeView={view} onNavigate={handleNavigate} />
      </Suspense>
    )
  }

  if (view === 'capsules') {
    return (
      <Suspense fallback={<PageLoading />}>
        <StudyCapsulesPage onNavigate={handleNavigate} />
        <Dock activeView={view} onNavigate={handleNavigate} />
      </Suspense>
    )
  }

  if (view === 'setup') {
    return (
      <Suspense fallback={<PageLoading />}>
        <SetupPage onNavigate={handleNavigate} />
        <Dock activeView={view} onNavigate={handleNavigate} />
      </Suspense>
    )
  }

  if (view === 'tutor') {
    return (
      <Suspense fallback={<PageLoading />}>
        <TutorPage />
        <Dock activeView={view} onNavigate={handleNavigate} />
      </Suspense>
    )
  }

  if (view === 'exams') {
    return (
      <Suspense fallback={<PageLoading />}>
        <ExamsPage onNavigate={handleNavigate} />
        <Dock activeView={view} onNavigate={handleNavigate} />
      </Suspense>
    )
  }

  /* ── Landing Page ───────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* Navigation */}
      <nav
        className={`fixed inset-x-0 top-0 z-50 flex items-center transition-all duration-200 h-[calc(4rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] ${
          scrolled
            ? 'border-b border-border bg-background/95 backdrop-blur-lg'
            : 'bg-background/80 backdrop-blur'
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-foreground text-sm font-black text-background">
              S
            </div>
            <span className="text-lg font-bold tracking-tight">StudySpark</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Log In
            </Button>
            <Button size="sm" onClick={() => handleNavigate('setup')}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative pt-[calc(4rem+env(safe-area-inset-top))]">
        {/* ── Hero ────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-xl px-5 pb-10 pt-8 text-center sm:px-6 sm:pb-14 sm:pt-14">
          <div className="landing-enter mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 shadow-sm">
            <Sparkles size={14} className="text-purple" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
              AI Study Engine
            </span>
          </div>

          <h1 className="landing-enter landing-enter-d1 text-[28px] font-extrabold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl">
            Notes in.{' '}
            <span className="text-gradient">Exam ready</span> out.
          </h1>

          <p className="landing-enter landing-enter-d2 mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted sm:mt-5 sm:text-base">
            Paste what you learned. StudySpark shapes it into a study capsule,
            starts focused practice, and tracks your exam readiness.
          </p>

          {/* Pipeline: Notes → Capsule → Study → Ready */}
          <div className="landing-enter landing-enter-d3 mx-auto mt-7 flex max-w-xs items-center justify-between sm:mt-8 sm:max-w-sm">
            {([
              { icon: FileText, label: 'Notes', color: 'text-muted' },
              { icon: Sparkles, label: 'Capsule', color: 'text-purple' },
              { icon: BookOpenCheck, label: 'Study', color: 'text-foreground' },
              { icon: GraduationCap, label: 'Ready', color: 'text-teal' },
            ] as const).map((step, i) => {
              const Icon = step.icon
              return (
                <Fragment key={step.label}>
                  {i > 0 && (
                    <ChevronRight size={14} className="shrink-0 text-border" />
                  )}
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`flex size-8 items-center justify-center rounded-xl border border-border bg-card shadow-sm ${step.color}`}
                    >
                      <Icon size={15} strokeWidth={2} />
                    </div>
                    <span className="text-[11px] font-semibold text-muted">
                      {step.label}
                    </span>
                  </div>
                </Fragment>
              )
            })}
          </div>

          {/* CTAs */}
          <div className="landing-enter landing-enter-d4 mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              onClick={() => handleNavigate('setup')}
              className="w-full sm:w-auto"
            >
              Start Studying
              <ArrowRight size={18} />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleDemoScroll}
              className="w-full sm:w-auto"
            >
              See How It Works
            </Button>
          </div>
        </section>

        {/* ── Product Demo ────────────────────────────────────────── */}
        <section
          id="product-demo"
          className="scroll-mt-20 px-5 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-12"
        >
          <div className="mx-auto max-w-2xl">
            <div className="landing-demo-enter mb-5 text-center sm:mb-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple">
                Live Demo
              </p>
              <h2 className="mt-2 text-xl font-extrabold tracking-tight sm:text-2xl">
                From notes to exam readiness
              </h2>
            </div>

            <div className="landing-demo-enter overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              {/* Demo header */}
              <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5 sm:py-4">
                <div>
                  <p className="text-sm font-bold">Biology · Photosynthesis</p>
                  <p className="mt-0.5 text-xs text-muted">Revision capsule</p>
                </div>
                <div className="rounded-lg bg-teal/10 px-3 py-1.5 text-sm font-black text-teal">
                  82%
                </div>
              </div>

              {/* Transformation: Notes → AI Capsule */}
              <div className="grid sm:grid-cols-2">
                <div className="border-b border-border p-4 sm:border-b-0 sm:border-r sm:p-5">
                  <div className="mb-2.5 flex items-center gap-2">
                    <FileText size={14} className="text-muted" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                      Your Notes
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      'Photosynthesis uses light energy to make glucose in chloroplasts.',
                      'Light reaction splits water, releases oxygen, and makes ATP.',
                      'Calvin cycle uses carbon dioxide to build sugars.',
                    ].map((note) => (
                      <p
                        key={note}
                        className="rounded-lg bg-background p-2 text-[13px] leading-snug text-muted"
                      >
                        {note}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="mb-2.5 flex items-center gap-2">
                    <Sparkles size={14} className="text-purple" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple">
                      AI Capsule
                    </p>
                  </div>
                  <p className="text-sm font-bold">Photosynthesis in 12 min</p>
                  <ul className="mt-2.5 space-y-2">
                    {[
                      'Core idea: light energy becomes chemical energy.',
                      'Must know: chloroplast, ATP, glucose, oxygen.',
                      'Practice next: label the two-stage process.',
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex gap-2 text-[13px] leading-snug"
                      >
                        <CheckCircle2
                          size={14}
                          className="mt-0.5 shrink-0 text-teal"
                        />
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Stats strip */}
              <div className="grid grid-cols-3 border-t border-border">
                <div className="flex flex-col items-center py-3">
                  <Clock size={15} className="mb-1 text-purple" />
                  <p className="text-base font-black tabular-nums">12:00</p>
                  <p className="text-[11px] text-muted">Study block</p>
                </div>
                <div className="flex flex-col items-center border-x border-border py-3">
                  <BookOpenCheck size={15} className="mb-1 text-purple" />
                  <p className="text-base font-black">3</p>
                  <p className="text-[11px] text-muted">Key topics</p>
                </div>
                <div className="flex flex-col items-center py-3">
                  <GraduationCap size={15} className="mb-1 text-teal" />
                  <p className="text-base font-black">82%</p>
                  <p className="text-[11px] text-muted">Exam ready</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ──────────────────────────────────────────── */}
        <section className="px-5 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-5 rounded-2xl border border-border bg-card p-6 text-center shadow-sm sm:flex-row sm:gap-6 sm:p-8 sm:text-left">
            <div className="flex-1">
              <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                Ready for today&apos;s study action?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Set your subjects, exam date, and available study time.
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => handleNavigate('setup')}
              className="w-full shrink-0 sm:w-auto"
            >
              Create Study Plan
              <ArrowRight size={18} />
            </Button>
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <footer className="border-t border-border px-5 py-8 sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-md bg-foreground text-xs font-black text-background">
                S
              </div>
              <span className="text-sm font-bold tracking-tight">
                StudySpark
              </span>
            </div>
            <p className="text-center text-xs text-muted sm:text-right">
              Built for students turning class material into exam confidence.
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<PageLoading />}>
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
        <Route
          path="/tutor"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
