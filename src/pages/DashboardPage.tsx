import type { View } from '../types/navigation'
import { BentoCard } from '../components/ui/BentoCard'
import { Button } from '../components/ui/Button'
import { ThemeToggle } from '../components/ThemeToggle'
import { Flame, Timer, Zap, Plus, FileText, ArrowRight, Calendar, Box, ArrowLeft } from 'lucide-react'

interface DashboardPageProps {
  onNavigate: (view: View) => void
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-background pb-40 transition-colors duration-500">
      {/* Dynamic Header */}
      <header className="mx-auto max-w-7xl px-6 pt-8 lg:pt-12">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('landing')} className="gap-2">
            <ArrowLeft size={16} />
            Back
          </Button>
          <ThemeToggle />
        </div>
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">{currentDate}</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl lg:text-7xl">
              Welcome back, <span className="text-gradient">Alex.</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-muted/80 font-medium">
              You're currently in the <span className="text-foreground font-bold">top 5%</span> of learners this week. 3 exams approaching. Time to execute.
            </p>
          </div>
          <div className="flex shrink-0 gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
            <Button variant="outline" size="md" className="gap-2">
              <Calendar size={18} />
              Schedule
            </Button>
            <Button size="md" className="gap-2 shadow-xl shadow-purple/10" onClick={() => onNavigate('capsules')}>
              <Plus size={18} />
              New Capsule
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-12 grid max-w-7xl gap-6 px-6 md:grid-cols-12">
        {/* Main Focus Area */}
        <BentoCard
          className="md:col-span-8 md:row-span-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100"
          title="Daily Focus"
          description="Your priority learning tasks for today."
          badge="High Priority"
        >
          <div className="mt-6 space-y-4">
            {[
              { title: 'Organic Chemistry Review', time: '45m', status: 'In Progress', progress: 65 },
              { title: 'Macroeconomics Quiz', time: '20m', status: 'Up Next', progress: 0 },
              { title: 'Biology Lab Notes', time: '15m', status: 'Waiting', progress: 0 },
              { title: 'Calculus Problem Set', time: '30m', status: 'Completed', progress: 100 },
            ].map((task, idx) => (
              <div
                key={task.title}
                className="group relative flex items-center justify-between rounded-2xl border border-border bg-background/50 p-4 transition-all hover:bg-foreground/5"
                style={{ animationDelay: `${idx * 100 + 300}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className={`size-10 rounded-xl border border-border flex items-center justify-center font-bold text-[10px] transition-all duration-500 ${
                    task.progress === 100
                      ? 'bg-teal text-teal-foreground border-teal'
                      : task.progress > 0
                        ? 'bg-purple text-purple-foreground border-purple'
                        : 'bg-card text-muted'
                  }`}>
                    {task.progress === 100 ? <Zap size={14} fill="currentColor" /> : task.progress > 0 ? `${task.progress}%` : 'GO'}
                  </div>
                  <div>
                    <h4 className={`font-bold text-foreground transition-all ${task.status === 'Completed' ? 'line-through opacity-40' : ''}`}>{task.title}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{task.time} • {task.status}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 transition-opacity group-hover:opacity-100">
                  <ArrowRight size={16} />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-8 w-full border-dashed rounded-2xl">
            View all tasks
          </Button>
        </BentoCard>

        {/* Stats Bento */}
        <BentoCard
          className="md:col-span-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200"
          title="Streak"
          icon={<Flame className="text-orange-500" />}
        >
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-5xl font-black">14</span>
            <span className="text-[10px] font-black text-muted uppercase tracking-widest">Days</span>
          </div>
          <p className="mt-2 text-[10px] text-muted font-bold uppercase tracking-widest">Personal best!</p>
        </BentoCard>

        <BentoCard
          className="md:col-span-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
          title="Focus Time"
          icon={<Timer className="text-purple" />}
        >
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-5xl font-black">42.5</span>
            <span className="text-[10px] font-black text-muted uppercase tracking-widest">Hrs</span>
          </div>
          <p className="mt-2 text-[10px] text-purple font-bold uppercase tracking-widest">+12% from last week</p>
        </BentoCard>

        {/* Quick Insights */}
        <BentoCard
          className="md:col-span-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400"
          title="Recall Rate"
          icon={<Zap className="text-teal" />}
          badge="Insight"
        >
          <div className="mt-4 h-24 flex items-end gap-1">
            {[30, 45, 25, 60, 85, 40, 92].map((h, i) => (
              <div key={i} className="flex-1 bg-foreground/5 rounded-t-md transition-all hover:bg-teal h-full relative group">
                <div
                  className="absolute bottom-0 inset-x-0 bg-teal/20 rounded-t-md transition-all group-hover:bg-teal/50"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <p className="mt-4 text-[10px] font-black text-teal uppercase tracking-widest text-center">92% average today</p>
        </BentoCard>

        <BentoCard
          className="md:col-span-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500"
          title="Quick Actions"
          description="Accelerate your workflow."
        >
          <div className="mt-4 grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-border bg-card p-6 transition-all hover:border-purple/50 hover:bg-purple/5 group">
              <div className="size-12 rounded-2xl bg-purple/10 flex items-center justify-center text-purple transition-colors group-hover:bg-purple group-hover:text-purple-foreground">
                <Box size={24} />
              </div>
              <span className="font-bold text-xs uppercase tracking-widest">New Capsule</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-border bg-card p-6 transition-all hover:border-teal/50 hover:bg-teal/5 group">
              <div className="size-12 rounded-2xl bg-teal/10 flex items-center justify-center text-teal transition-colors group-hover:bg-teal group-hover:text-teal-foreground">
                <FileText size={24} />
              </div>
              <span className="font-bold text-xs uppercase tracking-widest">Create Quiz</span>
            </button>
          </div>
        </BentoCard>
      </main>
    </div>
  )
}
