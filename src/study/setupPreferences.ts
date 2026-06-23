import { useEffect, useState } from 'react'

export interface WeeklyAvailability {
  monday: boolean
  tuesday: boolean
  wednesday: boolean
  thursday: boolean
  friday: boolean
  saturday: boolean
  sunday: boolean
}

export interface SetupPreferences {
  subjects: string
  examDate: string
  dailyStudyMinutes: number
  weeklyAvailability: WeeklyAvailability
}

export interface SetupValidation {
  duplicateSubjects: string[]
  examDateIsPast: boolean
  studyTargetIsZero: boolean
  isValid: boolean
}

export const setupStorageKey = 'studyspark.setupPreferences'
const setupPreferencesChangedEvent = 'studyspark:setup-preferences-changed'

export const setupDays: { id: keyof WeeklyAvailability; label: string; shortLabel: string }[] = [
  { id: 'monday', label: 'Monday', shortLabel: 'Mon' },
  { id: 'tuesday', label: 'Tuesday', shortLabel: 'Tue' },
  { id: 'wednesday', label: 'Wednesday', shortLabel: 'Wed' },
  { id: 'thursday', label: 'Thursday', shortLabel: 'Thu' },
  { id: 'friday', label: 'Friday', shortLabel: 'Fri' },
  { id: 'saturday', label: 'Saturday', shortLabel: 'Sat' },
  { id: 'sunday', label: 'Sunday', shortLabel: 'Sun' },
]

export const defaultSetupPreferences: SetupPreferences = {
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

export function getLocalDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function getTodayDateKey() {
  return getLocalDateKey(new Date())
}

export function getWeekdayId(date: Date): keyof WeeklyAvailability {
  return setupDays[(date.getDay() + 6) % 7].id
}

function normalizePreferences(value: Partial<SetupPreferences>): SetupPreferences {
  return {
    ...defaultSetupPreferences,
    ...value,
    subjects: typeof value.subjects === 'string' ? value.subjects : defaultSetupPreferences.subjects,
    examDate: typeof value.examDate === 'string' ? value.examDate : defaultSetupPreferences.examDate,
    dailyStudyMinutes:
      typeof value.dailyStudyMinutes === 'number' ? value.dailyStudyMinutes : defaultSetupPreferences.dailyStudyMinutes,
    weeklyAvailability: {
      ...defaultSetupPreferences.weeklyAvailability,
      ...value.weeklyAvailability,
    },
  }
}

export function parseSetupSubjects(value: string, fallbackSubjects: string[]) {
  const subjects = value
    .split(',')
    .map((subject) => subject.trim())
    .filter(Boolean)

  return subjects.length > 0 ? subjects : fallbackSubjects
}

export function validateSetupPreferences(preferences: SetupPreferences): SetupValidation {
  const normalizedSubjects = preferences.subjects
    .split(',')
    .map((subject) => subject.trim())
    .filter(Boolean)
  const seenSubjects = new Set<string>()
  const duplicateSubjects = normalizedSubjects.filter((subject) => {
    const subjectKey = subject.toLowerCase()

    if (seenSubjects.has(subjectKey)) {
      return true
    }

    seenSubjects.add(subjectKey)
    return false
  })
  const examDateIsPast = Boolean(preferences.examDate && preferences.examDate < getTodayDateKey())
  const studyTargetIsZero = !Number.isFinite(preferences.dailyStudyMinutes) || preferences.dailyStudyMinutes <= 0

  return {
    duplicateSubjects: [...new Set(duplicateSubjects)],
    examDateIsPast,
    studyTargetIsZero,
    isValid: duplicateSubjects.length === 0 && !examDateIsPast && !studyTargetIsZero,
  }
}

export function loadSetupPreferences(): SetupPreferences {
  try {
    const storedValue = localStorage.getItem(setupStorageKey)

    if (!storedValue) {
      return defaultSetupPreferences
    }

    return normalizePreferences(JSON.parse(storedValue) as Partial<SetupPreferences>)
  } catch {
    return defaultSetupPreferences
  }
}

export function saveSetupPreferences(preferences: SetupPreferences) {
  const normalizedPreferences = normalizePreferences(preferences)

  localStorage.setItem(setupStorageKey, JSON.stringify(normalizedPreferences))
  window.dispatchEvent(new CustomEvent(setupPreferencesChangedEvent))
}

export function useSetupPreferences() {
  const [preferences, setPreferences] = useState<SetupPreferences>(() => loadSetupPreferences())

  useEffect(() => {
    const refreshPreferences = () => setPreferences(loadSetupPreferences())

    window.addEventListener('storage', refreshPreferences)
    window.addEventListener(setupPreferencesChangedEvent, refreshPreferences)

    return () => {
      window.removeEventListener('storage', refreshPreferences)
      window.removeEventListener(setupPreferencesChangedEvent, refreshPreferences)
    }
  }, [])

  return preferences
}
