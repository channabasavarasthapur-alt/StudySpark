export interface DashboardTask {
  title: string
  time: string
  status: 'Priority' | 'Next' | 'Waiting' | 'Done'
  progress: number
}

export interface DashboardData {
  headerStatus: string
  userName: string
  heroMessage: string
  studyStreak: string
  examReadiness: {
    description: string
    percentage: number
    mastered: number
    toReview: number
  }
  currentMission: {
    title: string
    subtitle: string
    badge: string
  }
  syllabus: {
    title: string
    description: string
    tasks: DashboardTask[]
  }
}

export const dashboardData: DashboardData = {
  headerStatus: 'Biology Exam in 13h',
  userName: 'Guest',
  heroMessage: "You're almost there. Focus on your top capsules tonight.",
  studyStreak: '2 Days',
  examReadiness: {
    description: 'Your syllabus mastery for Biology.',
    percentage: 75,
    mastered: 12,
    toReview: 4,
  },
  currentMission: {
    title: 'Organic Chemistry Review',
    subtitle: 'Last studied 2 hours ago - 15m remaining',
    badge: 'Priority',
  },
  syllabus: {
    title: "Tonight's Syllabus",
    description: 'Everything you need to cover before tomorrow.',
    tasks: [
      { title: 'Organic Chemistry Review', time: '15m left', status: 'Priority', progress: 65 },
      { title: 'Macroeconomics Quiz', time: '20m task', status: 'Next', progress: 0 },
      { title: 'Biology Lab Notes', time: '10m read', status: 'Waiting', progress: 0 },
      { title: 'Calculus Problem Set', time: 'Completed', status: 'Done', progress: 100 },
    ],
  },
}
