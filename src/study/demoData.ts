import type { StudySession } from './studyContext'
import { getLocalDateKey, type SetupPreferences } from './setupPreferences'

export const demoCapsulesStorageKey = 'studyspark.capsuleLibrary'
export const demoCompletedTasksStorageKey = 'studyspark.completedStudyPlanTasks'

interface DemoCapsule {
  id: string
  title: string
  subject: string
  createdAt: string
  content: string
}

interface DemoCompletedTask {
  id: string
  title: string
  subject: string
  durationMinutes: number
  completedAt: string
  dateKey: string
}

function dateOffset(days: number, hour = 10, minute = 0) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(hour, minute, 0, 0)

  return date
}

function dateKey(days: number) {
  return getLocalDateKey(dateOffset(days))
}

export function getDemoSetupPreferences(): SetupPreferences {
  return {
    subjects: 'Physics, Chemistry, Mathematics, Biology',
    examDate: dateKey(42),
    dailyStudyMinutes: 120,
    weeklyAvailability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: false,
    },
  }
}

export function getDemoCapsules(): DemoCapsule[] {
  return [
    {
      id: 'demo-capsule-physics-motion',
      title: 'Physics: Motion and Forces',
      subject: 'Physics',
      createdAt: dateOffset(-1, 16, 20).toISOString(),
      content: 'Subject: Physics\nReview velocity, acceleration, Newton laws, and free-body diagrams before mixed problem practice.',
    },
    {
      id: 'demo-capsule-chemistry-bonding',
      title: 'Chemistry: Chemical Bonding',
      subject: 'Chemistry',
      createdAt: dateOffset(-2, 18, 5).toISOString(),
      content: 'Subject: Chemistry\nCompare ionic, covalent, and metallic bonding. Focus on polarity, shape, and bond energy trends.',
    },
    {
      id: 'demo-capsule-math-calculus',
      title: 'Mathematics: Calculus Review',
      subject: 'Mathematics',
      createdAt: dateOffset(-3, 19, 10).toISOString(),
      content: 'Subject: Mathematics\nRevise limits, derivative rules, tangent interpretation, and basic optimization questions.',
    },
  ]
}

export function getDemoCompletedTasks(): DemoCompletedTask[] {
  return [
    {
      id: `${dateKey(0)}-physics`,
      title: 'Physics study block',
      subject: 'Physics',
      durationMinutes: 30,
      completedAt: dateOffset(0, 8, 45).toISOString(),
      dateKey: dateKey(0),
    },
    {
      id: `${dateKey(0)}-chemistry`,
      title: 'Chemistry study block',
      subject: 'Chemistry',
      durationMinutes: 30,
      completedAt: dateOffset(0, 9, 30).toISOString(),
      dateKey: dateKey(0),
    },
    {
      id: `${dateKey(-1)}-mathematics`,
      title: 'Mathematics study block',
      subject: 'Mathematics',
      durationMinutes: 30,
      completedAt: dateOffset(-1, 17, 15).toISOString(),
      dateKey: dateKey(-1),
    },
    {
      id: `${dateKey(-2)}-biology`,
      title: 'Biology study block',
      subject: 'Biology',
      durationMinutes: 30,
      completedAt: dateOffset(-2, 18, 0).toISOString(),
      dateKey: dateKey(-2),
    },
  ]
}

export function getDemoStudySessions(): StudySession[] {
  return [
    {
      id: 'demo-session-physics-1',
      source: 'capsule',
      title: 'Physics: Motion and Forces',
      relatedCapsuleId: 'demo-capsule-physics-motion',
      startedAt: dateOffset(0, 8, 15).toISOString(),
      completedAt: dateOffset(0, 8, 45).toISOString(),
      durationMinutes: 30,
      plannedMinutes: 30,
    },
    {
      id: 'demo-session-chemistry-1',
      source: 'capsule',
      title: 'Chemistry: Chemical Bonding',
      relatedCapsuleId: 'demo-capsule-chemistry-bonding',
      startedAt: dateOffset(0, 9, 0).toISOString(),
      completedAt: dateOffset(0, 9, 30).toISOString(),
      durationMinutes: 30,
      plannedMinutes: 30,
    },
    {
      id: 'demo-session-math-1',
      source: 'exam-prep',
      title: 'Mathematics exam review',
      startedAt: dateOffset(-1, 17, 0).toISOString(),
      completedAt: dateOffset(-1, 17, 30).toISOString(),
      durationMinutes: 30,
      plannedMinutes: 30,
    },
    {
      id: 'demo-session-biology-1',
      source: 'revision',
      title: 'Biology revision',
      startedAt: dateOffset(-2, 18, 0).toISOString(),
      completedAt: dateOffset(-2, 18, 25).toISOString(),
      durationMinutes: 25,
      plannedMinutes: 30,
    },
  ]
}
