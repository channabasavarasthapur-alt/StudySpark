import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  BookOpenCheck,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Database,
  RotateCcw,
  Save,
  Sparkles,
  Target,
  Trash2,
  LogOut,
  UserCircle,
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
import { useAuth } from '../auth/authContext'
import type { View } from '../types/navigation'

interface SetupPageProps {
  onNavigate: (view: View) => void
}

export default function SetupPage({ onNavigate }: SetupPageProps) {
  const { resetStudySessions, seedDemoSessions } = useStudy()
  const { signOut, user } = useAuth()
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
  const hasExamConfigured = Boolean(preferences.examDate)

  const onboardingSteps = [
    {
      title: 'Subjects',
      helper: 'Add what you are studying.',
      icon: BookOpenCheck,
    },
    {
      title: 'Exam Date',
      helper: 'Give the assistant a deadline.',
      icon: CalendarDays,
    },
    {
      title: 'Study Time',
      helper: 'Set your realistic daily study target.',
      icon: Clock,
    },
    {
      title: 'Availability',
      helper: 'Choose active days to study.',
      icon: Target,
    },
  ]
  const currentStep = onboardingSteps[activeStep]
  const CurrentStepIcon = currentStep.icon

  useEffect(() => {
    if (!validation.isValid) {
      return
    }

    const timer = setTimeout(() => {
      saveSetupPreferences(preferences)
    }, 500)

    return () => clearTimeout(timer)
  }, [preferences, validation.isValid])

  const updatePreference = <Key extends keyof SetupPreferences>(
    key: Key,
    value: SetupPreferences[Key],
  ) => {
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

  const removeSubject = (subjectToRemove: string) => {
    const nextSubjects = subjects
      .filter((s) => s.toLowerCase() !== subjectToRemove.toLowerCase())
      .join(', ')
    updatePreference('subjects', nextSubjects)
  }

  const handleSave = () => {
    if (!validation.isValid) {
      return
    }

    saveSetupPreferences(preferences)
    setStatusMessage(
      `Saved at ${new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date())}`,
    )
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all setup preferences to default?')) {
      setPreferences(defaultSetupPreferences)
      saveSetupPreferences(defaultSetupPreferences)
      setStatusMessage('Setup reset to defaults')
    }
  }

  const handleSeedDemoData = () => {
    if (
      window.confirm(
        'Are you sure you want to load the demo profile? This will replace your current study setup, capsules, completed tasks, and study sessions.'
      )
    ) {
      const demoPreferences = getDemoSetupPreferences()

      try {
        localStorage.setItem(demoCapsulesStorageKey, JSON.stringify(getDemoCapsules()))
        localStorage.setItem(demoCompletedTasksStorageKey, JSON.stringify(getDemoCompletedTasks()))
      } catch (e) {
        console.error('Failed to seed demo data in localStorage:', e)
      }
      saveSetupPreferences(demoPreferences)
      seedDemoSessions(getDemoStudySessions())
      setPreferences(demoPreferences)
      setStatusMessage('Sample school demo loaded')
    }
  }

  const handleResetDemoData = () => {
    if (window.confirm('Are you sure you want to clear the demo profile and reset all study data?')) {
      try {
        localStorage.removeItem(demoCapsulesStorageKey)
        localStorage.removeItem(demoCompletedTasksStorageKey)
      } catch (e) {
        console.error('Failed to clear demo data in localStorage:', e)
      }
      resetStudySessions()
      setPreferences(defaultSetupPreferences)
      saveSetupPreferences(defaultSetupPreferences)
      setStatusMessage('Sample demo cleared')
    }
  }

  const studyPresets = [
    { label: '30m', value: 30 },
    { label: '45m', value: 45 },
    { label: '1h', value: 60 },
    { label: '1.5h', value: 90 },
    { label: '2h', value: 120 },
    { label: '3h', value: 180 },
  ]

  return (
    <div className="min-h-screen bg-background pb-[calc(8rem+env(safe-area-inset-bottom))] transition-colors duration-500 sm:pb-[calc(6rem+env(safe-area-inset-bottom))]">
      {/* Header */}
      <header className="mx-auto max-w-2xl px-5 pt-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('dashboard')}
            className="gap-2 text-muted hover:text-foreground"
          >
            <ArrowLeft size={15} />
            Back to dashboard
          </Button>
          <ThemeToggle />
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple">
            Assistant Setup
          </p>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Configure Study Plan
          </h1>
        </div>
      </header>

      <main className="mx-auto mt-6 max-w-2xl px-5 space-y-6">
        {/* Guided Steps indicator */}
        <section className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CurrentStepIcon className="text-purple shrink-0" size={18} />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple">
                Step {activeStep + 1} of {onboardingSteps.length}
              </span>
              <h2 className="text-sm font-bold text-foreground">{currentStep.title}</h2>
            </div>
          </div>

          {/* Stepper dots */}
          <div className="flex gap-2">
            {onboardingSteps.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveStep(index)}
                aria-label={`Go to step ${index + 1}`}
                className={`size-2 rounded-full transition-all cursor-pointer ${
                  index === activeStep
                    ? 'bg-purple w-4'
                    : index < activeStep
                      ? 'bg-teal'
                      : 'bg-muted/30'
                }`}
              />
            ))}
          </div>
        </section>

        {/* Current Step Content Container */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
          <p className="text-xs text-muted leading-relaxed">{currentStep.helper}</p>

          <div className="space-y-4 pt-1">
            {/* Step 1: Subjects input */}
            {activeStep === 0 && (
              <div className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted">
                    Enter Subjects (comma-separated)
                  </span>
                  <textarea
                    value={preferences.subjects}
                    onChange={(event) => updatePreference('subjects', event.target.value)}
                    placeholder="E.g., Math, Biology, History, Chemistry"
                    className="h-32 w-full resize-none rounded-xl border border-border bg-background p-4 text-sm leading-relaxed text-foreground placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-purple/20"
                  />
                </label>

                {/* Tactile dynamic chips */}
                {subjects.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                      Your Subject List
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {subjects.map((sub, index) => (
                        <div key={`${sub}-${index}`} className="flex min-h-[44px] items-center gap-2 rounded-full border border-purple/20 bg-purple/5 pl-4 pr-1 text-sm font-medium text-purple shadow-sm">
                          {sub}
                          <button
                            type="button"
                            onClick={() => removeSubject(sub)}
                            className="min-h-[44px] min-w-[44px] -m-3 shrink-0 rounded-full flex items-center justify-center font-bold cursor-pointer touch-manipulation group/remove"
                            aria-label={`Remove ${sub}`}
                          >
                            <span className="size-4 flex items-center justify-center rounded-full group-hover/remove:bg-purple/10">×</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {validation.duplicateSubjects.length > 0 && (
                  <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-3 text-xs font-semibold text-red-500">
                    Remove duplicate subjects: {validation.duplicateSubjects.join(', ')}.
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Exam Date input */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted">
                    Exam Date
                  </span>
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 focus-within:ring-2 focus-within:ring-purple/20">
                    <CalendarDays size={18} className="shrink-0 text-purple" />
                    <input
                      type="date"
                      value={preferences.examDate}
                      min={getTodayDateKey()}
                      onChange={(event) => updatePreference('examDate', event.target.value)}
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-foreground outline-none"
                    />
                  </div>
                </label>

                {validation.examDateIsPast && (
                  <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-3 text-xs font-semibold text-red-500">
                    Choose today or a future exam date.
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Study Time input */}
            {activeStep === 2 && (
              <div className="space-y-5">
                <label className="block space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted">
                    Daily Study Target Minutes
                  </span>
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 focus-within:ring-2 focus-within:ring-purple/20">
                    <Clock size={18} className="shrink-0 text-purple" />
                    <input
                      type="number"
                      min={1}
                      max={720}
                      step={15}
                      value={preferences.dailyStudyMinutes}
                      onChange={(event) => {
                        const parsed = Number(event.target.value)
                        updatePreference('dailyStudyMinutes', Number.isFinite(parsed) ? parsed : 0)
                      }}
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-foreground outline-none"
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                      minutes
                    </span>
                  </div>
                </label>

                {/* Tactile target presets */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    Quick Presets
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {studyPresets.map((preset) => {
                      const isActive = preferences.dailyStudyMinutes === preset.value
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => updatePreference('dailyStudyMinutes', preset.value)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                            isActive
                              ? 'border-purple bg-purple text-purple-foreground shadow-sm'
                              : 'border-border bg-background text-muted hover:border-purple/35'
                          }`}
                        >
                          {preset.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {validation.studyTargetIsZero && (
                  <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-3 text-xs font-semibold text-red-500">
                    Daily study target must be greater than zero.
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Availability toggle */}
            {activeStep === 3 && (
              <div className="space-y-4">
                <span className="block text-xs font-bold uppercase tracking-widest text-muted">
                  Weekly availability
                </span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {setupDays.map((day) => {
                    const isAvailable = preferences.weeklyAvailability[day.id]

                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDay(day.id)}
                        aria-pressed={isAvailable}
                        className={`min-h-14 rounded-xl border px-3 py-2 text-center transition-all cursor-pointer last:col-span-2 sm:last:col-span-1 ${
                          isAvailable
                            ? 'border-purple bg-purple text-purple-foreground shadow-sm'
                            : 'border-border bg-background text-muted hover:border-purple/20'
                        }`}
                      >
                        <span className="block text-sm font-bold">{day.shortLabel}</span>
                        <span className="mt-0.5 block text-[8px] font-bold uppercase tracking-wider opacity-80">
                          {isAvailable ? 'Study' : 'Off'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Stepper buttons and status feedback */}
          <div className="mt-8 flex flex-col gap-5 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted">
              {statusMessage ?? 'Preferences save automatically when setup is valid.'}
            </p>
            <div className="grid grid-cols-2 gap-2.5 sm:flex">
              <Button
                variant="outline"
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                className="gap-1.5 min-h-11 text-xs"
              >
                <ChevronLeft size={14} />
                Back
              </Button>
              {activeStep < onboardingSteps.length - 1 ? (
                <Button
                  onClick={() =>
                    setActiveStep(Math.min(onboardingSteps.length - 1, activeStep + 1))
                  }
                  className="gap-1.5 min-h-11 text-xs"
                >
                  Next
                  <ChevronRight size={14} />
                </Button>
              ) : (
                <Button
                  onClick={handleSave}
                  disabled={!validation.isValid}
                  className="gap-1.5 min-h-11 text-xs"
                >
                  <Save size={14} />
                  Save Plan
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Current Setup Summary Snapshot details */}
        {hasExamConfigured && (
          <section className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <Sparkles size={16} className="text-purple" />
              <span className="text-xs font-bold uppercase tracking-widest text-muted">
                Plan Setup Snapshot
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="rounded-lg bg-background p-3 border border-border/80">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-muted">
                  Subjects
                </span>
                <span className="block text-sm font-bold text-foreground mt-0.5">
                  {subjects.length} added
                </span>
              </div>
              <div className="rounded-lg bg-background p-3 border border-border/80">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-muted">
                  Exam Countdown
                </span>
                <span className="block text-sm font-bold text-foreground mt-0.5">
                  {availableDays.length} available days
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Assistant Settings panel (Deemphasized: combined Demo & Account settings) */}
        <section className="pt-2">
          <details className="group rounded-2xl border border-border bg-card p-4 transition-all">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 min-h-[44px]">
              <div className="flex items-center gap-2.5">
                <Database size={16} className="text-purple" />
                <span className="text-xs font-bold uppercase tracking-widest text-muted">
                  Assistant Settings & Demo
                </span>
              </div>
              <ChevronDown
                size={16}
                className="shrink-0 text-muted transition-transform group-open:rotate-180"
              />
            </summary>

            <div className="mt-5 border-t border-border/60 pt-5 space-y-6">
              {/* Account widget */}
              <div className="flex items-center justify-between gap-4 bg-background/50 border border-border rounded-xl p-3.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserCircle className="text-purple shrink-0" size={18} />
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted">
                      Signed In User
                    </p>
                    <p className="text-xs font-bold text-foreground truncate">
                      {user?.email ?? 'Standard Local User'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="danger"
                  onClick={() => void signOut()}
                  className="min-h-9 text-xs px-3 border-red-500/10 bg-red-500/5 hover:bg-red-500/10 text-red-500"
                >
                  <LogOut size={13} className="mr-1 inline" />
                  Sign Out
                </Button>
              </div>

              {/* Demo actions list */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted">
                  Seed Sample Demo Data
                </h4>
                <p className="text-xs leading-relaxed text-muted">
                  Load ready-made study profiles (includes mockup capsules, historical focus logs, and sample exam subjects).
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button onClick={handleSeedDemoData} className="min-h-[44px] text-xs gap-1">
                    <Database size={13} />
                    Load Demo Profile
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleResetDemoData}
                    className="min-h-[44px] text-xs gap-1 border-red-500/10 bg-red-500/5 hover:bg-red-500/10 text-red-500"
                  >
                    <RotateCcw size={13} />
                    Clear Demo Profile
                  </Button>
                </div>
                <Button
                  variant="danger"
                  onClick={handleReset}
                  className="w-full min-h-[44px] text-xs gap-1 border-red-500/10 bg-red-500/5 hover:bg-red-500/10 text-red-500"
                >
                  <Trash2 size={13} />
                  Reset Setup Preferences to Default
                </Button>
              </div>
            </div>
          </details>
        </section>
      </main>
    </div>
  )
}
