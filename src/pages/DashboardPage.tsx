import type { View } from '../types/navigation'
import { BentoCard } from '../components/ui/BentoCard'
import { Button } from '../components/ui/Button'
import { ThemeToggle } from '../components/ThemeToggle'
import { Flame, Zap, Plus, ArrowRight, Trophy, Clock } from 'lucide-react'

interface DashboardPageProps {
  onNavigate: (view: View) => void
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  return (
    <div className="min-h-screen bg-background pb-40 transition-colors duration-500">
      {/* Mission Header */}
      <header className="mx-auto max-w-7xl px-6 pt-8 lg:pt-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 animate-in fade-in duration-700">
            <Clock size={12} className="text-purple" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted">Biology Exam in 13h</span>
          </div>
          <ThemeToggle />
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Finish strong, <span className="text-gradient">Guest.</span>
            </h1>
            <p className="mt-2 text-lg text-muted/80 font-medium">
              You're almost there. Focus on your top capsules tonight.
            </p>
          </div>

          {/* Study Streak - Kept for motivation */}
          <div className="flex items-center gap-3 rounded-2xl border border-orange-500/20 bg-orange-500/5 px-4 py-3 animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="flex size-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
              <Flame size={20} fill="currentColor" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-orange-500/60">Study Streak</p>
              <p className="text-xl font-black text-orange-500">2 Days</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-10 max-w-7xl px-6 space-y-6">
        {/* Mission Control: Exam Readiness & Resume Hero */}
        <div className="grid gap-6 md:grid-cols-12">
          {/* Exam Readiness Section */}
          <BentoCard
            className="md:col-span-5 lg:col-span-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100"
            title="Exam Readiness"
            description="Your syllabus mastery for Biology."
          >
            <div className="mt-6 flex flex-col items-center justify-center">
              <div className="relative flex size-40 items-center justify-center">
                <svg className="size-full -rotate-90 transform">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-border"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * 75) / 100}
                    strokeLinecap="round"
                    className="text-purple transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-black">75%</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted">Ready</span>
                </div>
              </div>
              <div className="mt-6 flex gap-4 w-full">
                <div className="flex-1 rounded-xl border border-border bg-background/50 p-3 text-center">
                  <p className="text-xs font-bold text-foreground">12</p>
                  <p className="text-[8px] font-black uppercase tracking-tighter text-muted">Mastered</p>
                </div>
                <div className="flex-1 rounded-xl border border-border bg-background/50 p-3 text-center">
                  <p className="text-xs font-bold text-foreground">4</p>
                  <p className="text-[8px] font-black uppercase tracking-tighter text-muted">To Review</p>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Resume Hero - Primary Action */}
          <BentoCard
            className="md:col-span-7 lg:col-span-8 overflow-hidden bg-gradient-to-br from-purple/5 to-teal/5 border-purple/20 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200"
            title="Current Mission"
            badge="Priority"
          >
            <div className="mt-8 flex h-full flex-col justify-between">
              <div>
                <h3 className="text-3xl font-black tracking-tight sm:text-4xl">Organic Chemistry Review</h3>
                <p className="mt-2 text-lg text-muted/80">Last studied 2 hours ago • 15m remaining</p>
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="flex-1 gap-2 text-lg font-black shadow-2xl shadow-purple/20"
                  onClick={() => onNavigate('capsules')}
                >
                  <Zap size={20} fill="currentColor" />
                  RESUME STUDYING
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 border-dashed"
                  onClick={() => onNavigate('capsules')}
                >
                  <Plus size={20} />
                  New Capsule
                </Button>
              </div>
            </div>
          </BentoCard>
        </div>

        {/* Mission List - Streamlined Tasks */}
        <BentoCard
          className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
          title="Tonight's Syllabus"
          description="Everything you need to cover before tomorrow."
          icon={<Trophy size={20} className="text-teal" />}
        >
          <div className="mt-6 space-y-3">
            {[
              { title: 'Organic Chemistry Review', time: '15m left', status: 'Priority', progress: 65 },
              { title: 'Macroeconomics Quiz', time: '20m task', status: 'Next', progress: 0 },
              { title: 'Biology Lab Notes', time: '10m read', status: 'Waiting', progress: 0 },
              { title: 'Calculus Problem Set', time: 'Completed', status: 'Done', progress: 100 },
            ].map((task, idx) => (
              <div
                key={task.title}
                className="group flex items-center justify-between rounded-2xl border border-border bg-background/50 p-4 transition-all hover:bg-foreground/5"
                style={{ animationDelay: `${idx * 100 + 400}ms` }}
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
                    <h4 className={`font-bold text-foreground transition-all ${task.status === 'Done' ? 'line-through opacity-40' : ''}`}>{task.title}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted">{task.time}</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-muted transition-transform group-hover:translate-x-1" />
              </div>
            ))}
          </div>
        </BentoCard>
      </main>
    </div>
  )
}
