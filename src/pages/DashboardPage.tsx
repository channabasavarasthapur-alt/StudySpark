import { Sidebar } from '../components/dashboard/Sidebar'
import { StatsCard } from '../components/dashboard/StatsCard'
import { CapsuleCard } from '../components/dashboard/CapsuleCard'
import { ExamCard } from '../components/dashboard/ExamCard'
import { QuickAction } from '../components/dashboard/QuickAction'
import { Flame, Timer, Box, Trophy, Plus, FileText, Zap } from 'lucide-react'
import type { View } from '../types/navigation'

interface DashboardPageProps {
  onBack: () => void
  onNavigate: (view: View) => void
}

const mockStats = [
  { label: 'Study Streak', value: '14 Days', icon: Flame, trend: 'Personal Best!', trendType: 'positive' as const },
  { label: 'Focus Hours', value: '42.5h', icon: Timer, trend: '+12% this week', trendType: 'positive' as const },
  { label: 'Capsules Created', value: '28', icon: Box, trend: '8 this month', trendType: 'neutral' as const },
  { label: 'Quiz Score', value: '92%', icon: Trophy, trend: 'Top 5% of students', trendType: 'positive' as const },
]

const recentCapsules = [
  { title: 'Organic Chemistry II', subject: 'Chemistry', progress: 75, lastActive: '2h ago' },
  { title: 'Modern Macroeconomics', subject: 'Economics', progress: 40, lastActive: '5h ago' },
  { title: 'Cell Biology Fundamentals', subject: 'Biology', progress: 90, lastActive: 'Yesterday' },
]

const upcomingExams = [
  { title: 'Molecular Genetics', date: 'June 15, 2024', daysLeft: 4, difficulty: 'High' as const },
  { title: 'Microeconomics Midterm', date: 'June 18, 2024', daysLeft: 7, difficulty: 'Medium' as const },
  { title: 'Inorganic Chemistry Quiz', date: 'June 21, 2024', daysLeft: 10, difficulty: 'Low' as const },
]

const quotes = [
  "The only way to learn a new programming language is by writing programs in it.",
  "Education is the most powerful weapon which you can use to change the world.",
  "The beautiful thing about learning is that no one can take it away from you.",
  "Success is the sum of small efforts, repeated day in and day out.",
]

export default function DashboardPage({ onBack, onNavigate }: DashboardPageProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Fixed quote to avoid lint error about impure functions during render
  const fixedQuote = quotes[0];

  return (
    <div className="min-h-screen bg-background text-foreground lg:pl-64">
      <Sidebar onBack={onBack} />

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        {/* Welcome Section */}
        <header className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-purple">{currentDate}</p>
            <h1 className="mt-2 text-4xl font-black text-foreground">Welcome back, Alex!</h1>
            <p className="mt-3 max-w-xl text-lg italic text-muted">
              &quot;{fixedQuote}&quot;
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onNavigate('capsules')}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-bold transition hover:border-purple/50"
            >
              <Plus size={18} className="text-purple" />
              New Capsule
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {mockStats.map((stat) => (
            <StatsCard key={stat.label} {...stat} />
          ))}
        </section>

        <div className="grid gap-10 lg:grid-cols-[1fr_0.4fr]">
          {/* Left Column: Recent Capsules */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black text-foreground">Recent Study Capsules</h2>
              <button className="text-sm font-bold text-purple hover:underline">View all</button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {recentCapsules.map((capsule) => (
                <CapsuleCard key={capsule.title} {...capsule} />
              ))}
            </div>
          </section>

          {/* Right Column: Exams & Quick Actions */}
          <div className="space-y-10">
            {/* Upcoming Exams */}
            <section>
              <h2 className="mb-6 text-2xl font-black text-foreground">Upcoming Exams</h2>
              <div className="space-y-4">
                {upcomingExams.map((exam) => (
                  <ExamCard key={exam.title} {...exam} />
                ))}
              </div>
            </section>

            {/* Quick Actions */}
            <section>
              <h2 className="mb-6 text-2xl font-black text-foreground">Quick Actions</h2>
              <div className="grid gap-4">
                <QuickAction
                  label="Generate Study Capsule"
                  icon={Box}
                  color="purple"
                  onClick={() => onNavigate('capsules')}
                />
                <QuickAction label="Start Focus Session" icon={Zap} color="teal" />
                <QuickAction label="Practice Flashcards" icon={FileText} color="purple" />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
