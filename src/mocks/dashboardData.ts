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
  headerStatus: 'Study plan ready',
  userName: 'Student',
  heroMessage: 'Focus on the next useful study action first.',
  studyStreak: '2 Days',
  examReadiness: {
    description: 'Readiness is calculated from completed study sessions.',
    percentage: 75,
    mastered: 12,
    toReview: 4,
  },
  currentMission: {
    title: 'Organic Chemistry Review',
    subtitle: 'Suggested review session based on the current study queue.',
    badge: 'Priority',
  },
  syllabus: {
    title: "Today's Study Plan",
    description: 'Suggested starting points for a focused session.',
    tasks: [
      { title: 'Organic Chemistry Review', time: '15m left', status: 'Priority', progress: 65 },
      { title: 'Macroeconomics Quiz', time: '20m task', status: 'Next', progress: 0 },
      { title: 'Biology Lab Notes', time: '10m read', status: 'Waiting', progress: 0 },
      { title: 'Calculus Problem Set', time: 'Completed', status: 'Done', progress: 100 },
    ],
  },
}
