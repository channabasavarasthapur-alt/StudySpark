import type { LucideIcon } from 'lucide-react'

interface CapsuleCardProps {
  topic: string
  summary: string
  concepts: string[]
  formulas: string[]
  tips: string[]
  time: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  icon: LucideIcon
}

export function CapsuleCard({
  topic,
  summary,
  concepts,
  formulas,
  tips,
  time,
  difficulty,
  icon: Icon
}: CapsuleCardProps) {
  const difficultyColors = {
    Easy: 'bg-teal/10 text-teal border-teal/20',
    Medium: 'bg-purple/10 text-purple border-purple/20',
    Hard: 'bg-red-500/10 text-red-500 border-red-500/20'
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card/50 p-8 backdrop-blur-xl transition-all hover:border-purple/30 hover:shadow-2xl hover:shadow-purple/5 group">
      <div className="absolute -right-16 -top-16 size-48 rounded-full bg-purple/5 blur-3xl group-hover:bg-purple/10 transition-colors" />

      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-2xl bg-purple/10 text-purple">
              <Icon size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-foreground">{topic}</h3>
              <div className="mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-sm font-medium text-muted">
                  <span className="size-1.5 rounded-full bg-purple" />
                  {time}
                </span>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${difficultyColors[difficulty]}`}>
                  {difficulty}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          <section>
            <h4 className="text-sm font-bold uppercase tracking-widest text-teal">Quick Summary</h4>
            <p className="mt-3 text-lg leading-relaxed text-muted">{summary}</p>
          </section>

          <div className="grid gap-8 md:grid-cols-2">
            <section>
              <h4 className="text-sm font-bold uppercase tracking-widest text-purple">Main Points</h4>
              <ul className="mt-4 space-y-3">
                {concepts.map((concept, index) => (
                  <li key={index} className="flex items-start gap-3 text-foreground">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-purple" />
                    <span className="font-medium">{concept}</span>
                  </li>
                ))}
              </ul>
            </section>

            {formulas.length > 0 && (
              <section>
                <h4 className="text-sm font-bold uppercase tracking-widest text-teal">Important Formulas</h4>
                <div className="mt-4 space-y-3">
                  {formulas.map((formula, index) => (
                    <div key={index} className="rounded-xl border border-teal/10 bg-teal/5 p-4 font-mono text-sm text-teal">
                      {formula}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <section className="rounded-2xl border border-purple/10 bg-purple/5 p-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-purple">Study Tips</h4>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {tips.map((tip, index) => (
                <div key={index} className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-purple text-[10px] font-bold text-purple-foreground">
                    {index + 1}
                  </span>
                  <p className="text-sm text-muted">{tip}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
