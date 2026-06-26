import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  BookOpenCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Database,
  RotateCcw,
  Save,
  Sparkles,
  Target,
  Trash2,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { ThemeToggle } from '../components/ThemeToggle'
import {
  demoCapsulesStorageKey,
  demoCompletedTasksStorageKey,
  getDemoCapsules,
  getDemoCompletedTasks,
  getDemoSetupPreferences,
  getDemoStudySessions,
} from '../study/demoData'
import {
  defaultSetupPreferences,
  getTodayDateKey,
  loadSetupPreferences,
  saveSetupPreferences,
  setupDays,
  type SetupPreferences,
  type WeeklyAvailability,
  validateSetupPreferences,
} from '../study/setupPreferences'
import { useStudy } from '../study/studyContext'
import type { View } from '../types/navigation'

interface SetupPageProps {
  onNavigate: (view: View) => void
}

function formatStudyTime(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) {
    return `${remainingMinutes}m`
  }

  if (remainingMinutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${remainingMinutes}m`
}

export default function SetupPage({ onNavigate }: SetupPageProps) {
  const { resetStudySessions, seedDemoSessions } = useStudy()
  const [preferences, setPreferences] = useState<SetupPreferences>(() => loadSetupPreferences())
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  const validation = useMemo(() => validateSetupPreferences(preferences), [preferences])

  const subjects = useMemo(
    () =>
      preferences.subjects
        .split(',')
        .map((subject) => subject.trim())
        .filter(Boolean),
    [preferences.subjects],
  )
  const availableDays = setupDays.filter((day) => preferences.weeklyAvailability[day.id])
  const weeklyMinutes = availableDays.length * preferences.dailyStudyMinutes
  const onboardingSteps = [
    {
      title: 'Subjects',
      helper: 'Teach StudySpark what you are studying.',
      icon: BookOpenCheck,
    },
    {
      title: 'Exam Date',
      helper: 'Give the assistant a deadline to plan toward.',
      icon: CalendarDays,
    },
    {
      title: 'Study Time',
      helper: 'Set a daily pace that feels realistic.',
      icon: Clock,
    },
    {
      title: 'Availability',
      helper: 'Choose the days StudySpark can schedule work.',
      icon: Target,
    },
  ]
  const currentStep = onboardingSteps[activeStep]
  const CurrentStepIcon = currentStep.icon

  useEffect(() => {
    if (!validation.isValid) {
      return
    }

    saveSetupPreferences(preferences)
  }, [preferences, validation.isValid])

  const updatePreference = <Key extends keyof SetupPreferences>(key: Key, value: SetupPreferences[Key]) => {
    setPreferences((currentPreferences) => ({
      ...currentPreferences,
      [key]: value,
    }))
  }

  const toggleDay = (day: keyof WeeklyAvailability) => {
    setPreferences((currentPreferences) => ({
      ...currentPreferences,
      weeklyAvailability: {
        ...currentPreferences.weeklyAvailability,
        [day]: !currentPreferences.weeklyAvailability[day],
      },
    }))
  }

  const handleSave = () => {
    if (!validation.isValid) {
      return
    }

    saveSetupPreferences(preferences)
    setStatusMessage(`Saved at ${new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date())}`)
  }

  const handleReset = () => {
    setPreferences(defaultSetupPreferences)
    saveSetupPreferences(defaultSetupPreferences)
    setStatusMessage('Setup reset to defaults')
  }

  const handleSeedDemoData = () => {
    const demoPreferences = getDemoSetupPreferences()

    localStorage.setItem(demoCapsulesStorageKey, JSON.stringify(getDemoCapsules()))
    localStorage.setItem(demoCompletedTasksStorageKey, JSON.stringify(getDemoCompletedTasks()))
    saveSetupPreferences(demoPreferences)
    seedDemoSessions(getDemoStudySessions())
    setPreferences(demoPreferences)
    setStatusMessage('Sample school demo loaded')
  }

  const handleResetDemoData = () => {
    localStorage.removeItem(demoCapsulesStorageKey)
    localStorage.removeItem(demoCompletedTasksStorageKey)
    resetStudySessions()
    setPreferences(defaultSetupPreferences)
    saveSetupPreferences(defaultSetupPreferences)
    setStatusMessage('Sample demo cleared')
  }

  return (
    <div className="min-h-screen bg-background pb-40 transition-colors duration-500">
      <header className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:pt-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')} className="gap-2">
            <ArrowLeft size={16} />
            Back to dashboard
          </Button>
          <ThemeToggle />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-purple">Study assistant setup</p>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Build your personal study assistant.
            </h1>
            <p className="mt-5 text-base leading-7 text-muted sm:text-lg">
              StudySpark uses your subjects, deadline, study pace, and available days to recommend what to do next.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-xl border border-purple/15 bg-purple/5 text-purple">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Assistant preview</p>
                <h2 className="text-xl font-extrabold text-foreground">{subjects.length || 'No'} subject{subjects.length === 1 ? '' : 's'}</h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted">
              {subjects.length > 0
                ? `StudySpark will balance ${subjects.slice(0, 3).join(', ')}${subjects.length > 3 ? ', and more' : ''} around your exam plan.`
                : 'Add subjects first so StudySpark knows what your plan is built around.'}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-10 grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-6">
          <nav className="grid gap-3 rounded-2xl border border-border bg-card p-2 shadow-sm md:grid-cols-4" aria-label="Setup steps">
            {onboardingSteps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = index === activeStep

              return (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => setActiveStep(index)}
                  className={`rounded-xl border p-4 text-left transition-colors duration-200 ${
                    isActive ? 'border-purple/30 bg-purple/5 text-foreground' : 'border-transparent text-muted hover:bg-background/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`grid size-9 shrink-0 place-items-center rounded-lg border ${isActive ? 'border-purple/20 bg-purple/10 text-purple' : 'border-border bg-background text-muted'}`}>
                      <StepIcon size={18} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-extrabold">{step.title}</span>
                      <span className="block truncate text-xs text-muted">{step.helper}</span>
                    </span>
                  </div>
                </button>
              )
            })}
          </nav>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-purple/15 bg-purple/5 text-purple">
                <CurrentStepIcon size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple">Step {activeStep + 1} of {onboardingSteps.length}</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">{currentStep.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{currentStep.helper}</p>
              </div>
            </div>

            <div className="mt-8">
              {activeStep === 0 && (
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                  <label className="block">
                    <span className="text-sm font-semibold text-foreground">Subjects</span>
                    <textarea
                      value={preferences.subjects}
                      onChange={(event) => updatePreference('subjects', event.target.value)}
                      placeholder="Math, Physics, Chemistry, English"
                      className="mt-2 h-40 w-full resize-none rounded-xl border border-border bg-background/70 p-4 text-base leading-7 text-foreground placeholder:text-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-purple/20"
                    />
                    <span className="mt-2 block text-xs leading-5 text-muted">Separate subjects with commas.</span>
                    {validation.duplicateSubjects.length > 0 && (
                      <span className="mt-2 block text-sm font-semibold text-red-500">
                        Remove duplicate subject{validation.duplicateSubjects.length === 1 ? '' : 's'}: {validation.duplicateSubjects.join(', ')}.
                      </span>
                    )}
                  </label>

                  <div className="rounded-2xl border border-border bg-background/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Why this matters</p>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      Subjects become the assistant&apos;s map. They decide how capsules, dashboard tasks, and exam readiness are grouped.
                    </p>
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                  <label className="block">
                    <span className="text-sm font-semibold text-foreground">Exam date</span>
                    <div className="mt-2 flex items-center gap-3 rounded-xl border border-border bg-background/70 px-4 py-3 focus-within:ring-2 focus-within:ring-purple/20">
                      <CalendarDays size={18} className="shrink-0 text-purple" />
                      <input
                        type="date"
                        value={preferences.examDate}
                        min={getTodayDateKey()}
                        onChange={(event) => updatePreference('examDate', event.target.value)}
                        className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-foreground outline-none"
                      />
                    </div>
                    {validation.examDateIsPast && (
                      <span className="mt-2 block text-sm font-semibold text-red-500">Choose today or a future exam date.</span>
                    )}
                  </label>

                  <div className="rounded-2xl border border-border bg-background/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Why this matters</p>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      The exam date turns study into a countdown. StudySpark can prioritize weak subjects more urgently as the deadline approaches.
                    </p>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                  <label className="block">
                    <span className="text-sm font-semibold text-foreground">Daily study time</span>
                    <div className="mt-2 flex items-center gap-3 rounded-xl border border-border bg-background/70 px-4 py-3 focus-within:ring-2 focus-within:ring-purple/20">
                      <Clock size={18} className="shrink-0 text-purple" />
                      <input
                        type="number"
                        min={1}
                        max={720}
                        step={15}
                        value={preferences.dailyStudyMinutes}
                        onChange={(event) => updatePreference('dailyStudyMinutes', Number(event.target.value))}
                        className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-foreground outline-none"
                      />
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted">minutes</span>
                    </div>
                    {validation.studyTargetIsZero && (
                      <span className="mt-2 block text-sm font-semibold text-red-500">Daily study target must be greater than zero.</span>
                    )}
                  </label>

                  <div className="rounded-2xl border border-border bg-background/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Why this matters</p>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      A realistic daily target helps StudySpark create tasks students can actually finish instead of an impossible plan.
                    </p>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <fieldset>
                  <legend className="text-sm font-semibold text-foreground">Weekly availability</legend>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                    Choose the days your assistant can schedule study blocks. Off days stay clear.
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                    {setupDays.map((day) => {
                      const isAvailable = preferences.weeklyAvailability[day.id]

                      return (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => toggleDay(day.id)}
                          aria-pressed={isAvailable}
                          className={`min-h-16 rounded-xl border px-3 py-3 text-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple/30 ${
                            isAvailable
                              ? 'border-purple bg-purple text-purple-foreground shadow-sm'
                              : 'border-border bg-background/70 text-muted hover:border-purple/30 hover:bg-purple/5 hover:text-foreground'
                          }`}
                        >
                          <span className="block text-sm font-extrabold">{day.shortLabel}</span>
                          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wider">
                            {isAvailable ? 'Available' : 'Off'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </fieldset>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">{statusMessage ?? 'Preferences save automatically when the setup is valid.'}</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => setActiveStep(Math.max(0, activeStep - 1))} disabled={activeStep === 0} className="gap-2">
                  <ChevronLeft size={16} />
                  Back
                </Button>
                {activeStep < onboardingSteps.length - 1 ? (
                  <Button onClick={() => setActiveStep(Math.min(onboardingSteps.length - 1, activeStep + 1))} className="gap-2">
                    Next
                    <ChevronRight size={16} />
                  </Button>
                ) : (
                  <Button onClick={handleSave} disabled={!validation.isValid} className="gap-2">
                    <Save size={16} />
                    Save Plan
                  </Button>
                )}
              </div>
            </div>
          </section>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple">Demo workspace</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">Load sample school data</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Show a ready-made student profile with subjects, an exam date, capsules, sessions, and progress.
            </p>
            <div className="mt-5 grid gap-3">
              <Button onClick={handleSeedDemoData} className="gap-2">
                <Database size={16} />
                Load Sample Demo
              </Button>
              <Button variant="danger" onClick={handleResetDemoData} className="gap-2">
                <RotateCcw size={16} />
                Clear Sample Demo
              </Button>
              <Button variant="danger" onClick={handleReset} className="gap-2">
                <Trash2 size={16} />
                Reset Setup
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple">Plan snapshot</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">Your setup</h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-border bg-background/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Subjects</p>
                {subjects.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {subjects.map((subject) => (
                      <span key={subject} className="rounded-lg border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground">
                        {subject}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-muted">No subjects added yet.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-background/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">Exam date</p>
                  <p className="mt-2 text-lg font-extrabold text-foreground">{preferences.examDate || 'Not set'}</p>
                </div>
                <div className="rounded-xl border border-border bg-background/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">Daily time</p>
                  <p className="mt-2 text-lg font-extrabold text-foreground">{formatStudyTime(preferences.dailyStudyMinutes)}</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Weekly availability</p>
                <p className="mt-2 text-lg font-extrabold text-foreground">{availableDays.length} days available</p>
                <p className="mt-1 text-sm leading-6 text-muted">{formatStudyTime(weeklyMinutes)} planned study time per week.</p>
              </div>
            </div>
          </section>
        </aside>
      </main>
    </div>
  )
}
