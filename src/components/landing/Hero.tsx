import type { View } from '../../types/navigation'

export function Hero({ onNavigate }: { onNavigate: (view: View) => void }) {
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

const stats = [
  { label: 'Recall score', value: '86%' },
  { label: 'Focus block', value: '24m' },
  { label: 'Days left', value: '12' },
]

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
