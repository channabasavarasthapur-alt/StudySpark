export function WhyStudySpark() {
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
