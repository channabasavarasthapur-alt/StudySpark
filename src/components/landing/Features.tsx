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

export function Features() {
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
