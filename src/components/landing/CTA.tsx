import type { View } from '../../types/navigation'

export function CTA({ onNavigate }: { onNavigate: (view: View) => void }) {
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
