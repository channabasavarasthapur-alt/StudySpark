import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CalendarDays, Clock, Save, Settings, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { ThemeToggle } from '../components/ThemeToggle'
import type { View } from '../types/navigation'

interface SetupPageProps {
  onNavigate: (view: View) => void
}

interface WeeklyAvailability {
  monday: boolean
  tuesday: boolean
  wednesday: boolean
  thursday: boolean
  friday: boolean
  saturday: boolean
  sunday: boolean
}

interface SetupPreferences {
  subjects: string
  examDate: string
  dailyStudyMinutes: number
  weeklyAvailability: WeeklyAvailability
}

const storageKey = 'studyspark.setupPreferences'

const days: { id: keyof WeeklyAvailability; label: string; shortLabel: string }[] = [
  { id: 'monday', label: 'Monday', shortLabel: 'Mon' },
  { id: 'tuesday', label: 'Tuesday', shortLabel: 'Tue' },
  { id: 'wednesday', label: 'Wednesday', shortLabel: 'Wed' },
  { id: 'thursday', label: 'Thursday', shortLabel: 'Thu' },
  { id: 'friday', label: 'Friday', shortLabel: 'Fri' },
  { id: 'saturday', label: 'Saturday', shortLabel: 'Sat' },
  { id: 'sunday', label: 'Sunday', shortLabel: 'Sun' },
]

const defaultPreferences: SetupPreferences = {
  subjects: '',
  examDate: '',
  dailyStudyMinutes: 90,
  weeklyAvailability: {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  },
}

function loadPreferences(): SetupPreferences {
  try {
    const storedValue = localStorage.getItem(storageKey)

    if (!storedValue) {
      return defaultPreferences
    }

    const parsedValue = JSON.parse(storedValue) as Partial<SetupPreferences>

    return {
      ...defaultPreferences,
      ...parsedValue,
      weeklyAvailability: {
        ...defaultPreferences.weeklyAvailability,
        ...parsedValue.weeklyAvailability,
      },
      dailyStudyMinutes: parsedValue.dailyStudyMinutes ?? defaultPreferences.dailyStudyMinutes,
    }
  } catch {
    return defaultPreferences
  }
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
  const [preferences, setPreferences] = useState<SetupPreferences>(() => loadPreferences())
  const [savedAt, setSavedAt] = useState<string | null>(null)

  const subjects = useMemo(
    () =>
      preferences.subjects
        .split(',')
        .map((subject) => subject.trim())
        .filter(Boolean),
    [preferences.subjects],
  )
  const availableDays = days.filter((day) => preferences.weeklyAvailability[day.id])
  const weeklyMinutes = availableDays.length * preferences.dailyStudyMinutes

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(preferences))
  }, [preferences])

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
    localStorage.setItem(storageKey, JSON.stringify(preferences))
    setSavedAt(new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date()))
  }

  const handleReset = () => {
    setPreferences(defaultPreferences)
    localStorage.setItem(storageKey, JSON.stringify(defaultPreferences))
    setSavedAt(null)
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

        <div className="mt-10 max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted">Setup</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Shape your study plan.
          </h1>
          <p className="mt-5 text-base leading-7 text-muted sm:text-lg">
            Set the subjects, exam date, daily study time, and weekly availability StudySpark should remember.
          </p>
        </div>
      </header>

      <main className="mx-auto mt-10 grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-purple/15 bg-purple/5 text-purple">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Study settings</h2>
              <p className="mt-2 text-sm leading-6 text-muted">Changes are saved on this device with localStorage.</p>
            </div>
          </div>

          <div className="mt-8 space-y-8">
            <label className="block">
              <span className="text-sm font-semibold text-foreground">Subjects</span>
              <textarea
                value={preferences.subjects}
                onChange={(event) => updatePreference('subjects', event.target.value)}
                placeholder="Math, Physics, Chemistry, English"
                className="mt-2 h-32 w-full resize-none rounded-xl border border-border bg-background/70 p-4 text-base leading-7 text-foreground placeholder:text-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-purple/20"
              />
              <span className="mt-2 block text-xs leading-5 text-muted">Separate subjects with commas.</span>
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-foreground">Exam date</span>
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-border bg-background/70 px-4 py-3 focus-within:ring-2 focus-within:ring-purple/20">
                  <CalendarDays size={18} className="shrink-0 text-purple" />
                  <input
                    type="date"
                    value={preferences.examDate}
                    onChange={(event) => updatePreference('examDate', event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-foreground outline-none"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-foreground">Daily study time</span>
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-border bg-background/70 px-4 py-3 focus-within:ring-2 focus-within:ring-purple/20">
                  <Clock size={18} className="shrink-0 text-purple" />
                  <input
                    type="number"
                    min={15}
                    max={720}
                    step={15}
                    value={preferences.dailyStudyMinutes}
                    onChange={(event) => updatePreference('dailyStudyMinutes', Number(event.target.value))}
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-foreground outline-none"
                  />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">minutes</span>
                </div>
              </label>
            </div>

            <fieldset>
              <legend className="text-sm font-semibold text-foreground">Weekly availability</legend>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {days.map((day) => {
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
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">{savedAt ? `Saved at ${savedAt}` : 'Preferences save automatically as you edit.'}</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <Trash2 size={16} />
                Reset
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <Save size={16} />
                Save
              </Button>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
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
