import type { LucideIcon } from 'lucide-react'

interface CapsuleCardProps {
  topic: string
  summary: string
  concepts: string[]
  terms: string[]
  revisionPoints: string[]
  practiceQuestions: string[]
  time: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  icon: LucideIcon
}

export function CapsuleCard({
  topic,
  summary,
  concepts,
  terms,
  revisionPoints,
  practiceQuestions,
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
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-colors duration-200 hover:border-purple/20 sm:p-6">
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg border border-purple/15 bg-purple/5 text-purple">
              <Icon size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-foreground">{topic}</h3>
              <div className="mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-sm font-medium text-muted">
                  <span className="size-1.5 rounded-full bg-purple" />
                  {time} review
                </span>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${difficultyColors[difficulty]}`}>
                  {difficulty}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">Overview</h4>
            <p className="mt-3 text-base leading-7 text-muted sm:text-lg">{summary}</p>
          </section>

          <div className="grid gap-8 md:grid-cols-2">
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-purple">Key ideas</h4>
              <ul className="mt-4 space-y-3">
                {concepts.map((concept, index) => (
                  <li key={index} className="flex items-start gap-3 text-foreground">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-purple" />
                    <span className="font-medium leading-6">{concept}</span>
                  </li>
                ))}
              </ul>
            </section>

            {terms.length > 0 && (
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">Important terms</h4>
                <div className="mt-4 space-y-3">
                  {terms.map((term, index) => (
                    <div key={index} className="rounded-xl border border-teal/15 bg-teal/5 p-4 text-sm font-semibold text-teal">
                      {term}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <section className="rounded-xl border border-purple/10 bg-purple/5 p-5">
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-purple">Quick revision points</h4>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {revisionPoints.map((point, index) => (
                <div key={index} className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-purple text-[10px] font-bold text-purple-foreground">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-muted">{point}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">Practice questions</h4>
            <div className="mt-4 grid gap-3">
              {practiceQuestions.map((question, index) => (
                <div key={index} className="rounded-xl border border-border bg-background/70 p-4 text-sm font-medium leading-6 text-foreground">
                  {question}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
