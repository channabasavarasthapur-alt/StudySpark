import { useState } from 'react'
import { ThemeToggle } from './components/ThemeToggle'
import DashboardPage from './pages/DashboardPage'
import StudyCapsulesPage from './pages/StudyCapsulesPage'

const features = [
  {
    title: 'Study Capsules',
    description: 'Turn each topic into a focused learning sprint with goals, resources, and progress in one place.',
  },
  {
    title: 'Notes',
    description: 'Capture ideas quickly and keep your course material organized around what matters next.',
  },
  {
    title: 'Flashcards',
    description: 'Practice definitions, formulas, and concepts with recall-first cards built for repetition.',
  },
  {
    title: 'Quiz Generation',
    description: 'Convert notes into targeted checks that reveal what you understand and what needs another pass.',
  },
  {
    title: 'Pomodoro Timer',
    description: 'Stay locked in with structured focus blocks and restorative breaks between study sessions.',
  },
  {
    title: 'Exam Countdown',
    description: 'See upcoming deadlines clearly so revision plans stay realistic, calm, and on schedule.',
  },
  {
    title: 'Study Streaks',
    description: 'Build consistency with visible momentum that makes showing up feel rewarding.',
  },
]

const stats = [
  { label: 'Recall score', value: '86%' },
  { label: 'Focus block', value: '24m' },
  { label: 'Days left', value: '12' },
]

function Navbar({ onNavigate }: { onNavigate: (view: 'landing' | 'dashboard') => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <a href="#top" className="flex min-w-0 items-center gap-3" aria-label="StudySpark home">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-purple text-lg font-black text-purple-foreground shadow-[0_0_32px_color-mix(in_srgb,var(--purple)_45%,transparent)]">
            S
          </span>
          <span className="truncate text-lg font-semibold text-foreground">StudySpark</span>
        </a>

        <div className="hidden items-center gap-8 text-sm font-medium text-muted md:flex">
          <a className="transition hover:text-foreground" href="#features">
            Features
          </a>
          <a className="transition hover:text-foreground" href="#about">
            About
          </a>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => onNavigate('dashboard')}
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-teal hover:text-teal"
          >
            Login
          </button>
        </div>
      </nav>
    </header>
  )
}

function ProductVisual() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute -inset-6 rounded-[2rem] bg-purple/20 blur-3xl" />
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card/95 p-4 shadow-2xl shadow-slate-950/10">
        <div className="mb-4 flex items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-teal">Today&apos;s plan</p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">Biology Active Recall</h2>
          </div>
          <div className="rounded-lg bg-teal/10 px-3 py-2 text-sm font-bold text-teal">Streak 14</div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-background/60 p-4">
              <p className="text-xs text-muted">{stat.label}</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-border bg-background/60 p-4">
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="font-semibold text-foreground">Flashcard queue</p>
            <span className="rounded-md bg-purple/15 px-2.5 py-1 text-xs font-semibold text-purple">
              42 cards
            </span>
          </div>
          <div className="space-y-3">
            <div className="h-3 rounded-full bg-purple" />
            <div className="h-3 w-10/12 rounded-full bg-teal" />
            <div className="h-3 w-7/12 rounded-full bg-muted/30" />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-purple/25 bg-purple/10 p-4">
            <p className="text-sm font-semibold text-purple">Quiz ready</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Cell respiration, enzymes, and transport questions generated from your notes.
            </p>
          </div>
          <div className="rounded-xl border border-teal/25 bg-teal/10 p-4">
            <p className="text-sm font-semibold text-teal">Next exam</p>
            <p className="mt-2 text-3xl font-bold text-foreground">Jun 17</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Hero({ onNavigate }: { onNavigate: (view: 'landing' | 'dashboard') => void }) {
  return (
    <section
      id="top"
      className="mx-auto grid min-h-[calc(100svh-73px)] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_0.92fr] lg:py-20"
    >
      <div>
        <div className="mb-6 inline-flex items-center rounded-lg border border-teal/30 bg-teal/10 px-3 py-1.5 text-sm font-semibold text-teal">
          Active recall for modern students
        </div>
        <h1 className="max-w-4xl text-5xl font-black leading-[1.02] text-foreground sm:text-6xl lg:text-7xl">
          Study Smarter, Not Harder
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
          Transform notes into active recall and boost your learning.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => onNavigate('dashboard')}
            className="rounded-lg bg-purple px-6 py-3.5 text-base font-bold text-purple-foreground shadow-[0_16px_40px_color-mix(in_srgb,var(--purple)_28%,transparent)] transition hover:brightness-110"
          >
            Get Started
          </button>
          <a
            href="#features"
            className="rounded-lg border border-border bg-card px-6 py-3.5 text-center text-base font-bold text-foreground transition hover:border-teal hover:text-teal"
          >
            Explore Features
          </a>
        </div>
      </div>
      <ProductVisual />
    </section>
  )
}

function Features() {
  return (
    <section id="features" className="border-y border-border bg-card/45 px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-widest text-purple">Features</p>
          <h2 className="mt-3 text-3xl font-black text-foreground sm:text-4xl">
            Everything your study system needs.
          </h2>
          <p className="mt-4 text-lg leading-8 text-muted">
            StudySpark keeps planning, practice, focus, and momentum together in one clean workspace.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className="rounded-xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-purple/50 hover:shadow-xl hover:shadow-purple/10"
            >
              <div className="mb-5 grid size-11 place-items-center rounded-lg bg-teal/10 text-sm font-black text-teal">
                {String(index + 1).padStart(2, '0')}
              </div>
              <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
              <p className="mt-3 leading-7 text-muted">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function WhyStudySpark() {
  return (
    <section id="about" className="px-5 py-20 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1fr] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-teal">Why StudySpark</p>
          <h2 className="mt-3 text-3xl font-black text-foreground sm:text-4xl">
            Learning sticks when you retrieve it.
          </h2>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="text-lg leading-8 text-muted">
            Active recall strengthens memory by asking your brain to pull information out instead of passively reading it again.
            StudySpark turns notes into flashcards, quizzes, and focused review sessions so students can find weak spots early,
            practice deliberately, and walk into exams with more confidence.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {['Retrieve', 'Review', 'Retain'].map((step) => (
              <div
                key={step}
                className="rounded-lg border border-teal/20 bg-teal/10 px-4 py-3 text-center font-bold text-teal"
              >
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function CTA({ onNavigate }: { onNavigate: (view: 'landing' | 'dashboard') => void }) {
  return (
    <section className="px-5 pb-10 sm:px-8 sm:pb-16">
      <div className="mx-auto max-w-7xl rounded-2xl border border-purple/30 bg-purple/10 px-6 py-12 text-center shadow-[0_24px_80px_color-mix(in_srgb,var(--teal)_8%,transparent)] sm:px-10">
        <p className="text-sm font-bold uppercase tracking-widest text-teal">Ready when you are</p>
        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black text-foreground sm:text-5xl">
          Start your study journey today.
        </h2>
        <button
          onClick={() => onNavigate('dashboard')}
          className="mt-8 rounded-lg bg-teal px-6 py-3.5 text-base font-bold text-teal-foreground transition hover:brightness-110"
        >
          Get Started
        </button>
      </div>
    </section>
  )
}

function App() {
  const [view, setView] = useState<'landing' | 'dashboard' | 'capsules'>('landing')

  if (view === 'dashboard') {
    return <DashboardPage onBack={() => setView('landing')} onNavigate={setView} />
  }

  if (view === 'capsules') {
    return <StudyCapsulesPage onBack={() => setView('landing')} onNavigate={setView} />
  }

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <Navbar onNavigate={setView} />
      <main>
        <Hero onNavigate={setView} />
        <Features />
        <WhyStudySpark />
        <CTA onNavigate={setView} />
      </main>
    </div>
  )
}

export default App
