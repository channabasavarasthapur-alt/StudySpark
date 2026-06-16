import {
  AlertCircle,
  Atom,
  BarChart3,
  Brain,
  Calculator,
  CheckCircle2,
  Dna,
  FlaskConical,
  type LucideIcon,
} from 'lucide-react'

export interface CapsuleData {
  topic: string
  summary: string
  concepts: string[]
  formulas: string[]
  tips: string[]
  time: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  icon: LucideIcon
}

export interface InsightCardData {
  label: string
  value: string | number
  icon: LucideIcon
  description: string
  color: 'purple' | 'teal'
  progress?: number
}

export interface RecentSubjectCardData {
  subject: string
  icon: LucideIcon
  lastStudied: string
  progress: number
  streak: number
  color: 'purple' | 'teal'
}

export const loadingMessages = [
  'Reading your notes...',
  'Finding key concepts...',
  'Making main points...',
  'Organizing formulas...',
  'Almost done...',
]

export const sampleCapsule: CapsuleData = {
  topic: '[Sample] Quantum Entanglement',
  summary:
    'This is a sample synthesis generated from mock physics notes. Particles become interconnected such that their states are correlated regardless of distance.',
  concepts: ["Bell's Theorem", 'Wave Collapse', 'Qubits'],
  formulas: ['|psi> = alpha|0> + beta|1>', 'E = h * frequency'],
  tips: ['Example tip: Visualize the Bloch sphere.', 'Example tip: Observe entanglement constraints.'],
  time: '25m',
  difficulty: 'Hard',
  icon: Atom,
}

export const capsuleInsights: InsightCardData[] = [
  {
    label: 'Study Score',
    value: '--',
    icon: Brain,
    description: 'Score will show after you start studying.',
    color: 'purple',
    progress: 0,
  },
  {
    label: 'Understanding',
    value: 'High',
    icon: BarChart3,
    description: "You've understood the main points.",
    color: 'teal',
    progress: 88,
  },
  {
    label: 'Revision',
    value: 'Low',
    icon: AlertCircle,
    description: 'No need to revise immediately.',
    color: 'teal',
    progress: 12,
  },
  {
    label: 'Status',
    value: 'Saved',
    icon: CheckCircle2,
    description: 'Capsule added to your library.',
    color: 'purple',
  },
]

export const recentSubjects: RecentSubjectCardData[] = [
  {
    subject: 'Mathematics',
    icon: Calculator,
    lastStudied: 'Not yet',
    progress: 0,
    streak: 0,
    color: 'purple',
  },
  {
    subject: 'Physics',
    icon: Atom,
    lastStudied: 'Not yet',
    progress: 0,
    streak: 0,
    color: 'teal',
  },
  {
    subject: 'Chemistry',
    icon: FlaskConical,
    lastStudied: 'Not yet',
    progress: 0,
    streak: 0,
    color: 'purple',
  },
  {
    subject: 'Biology',
    icon: Dna,
    lastStudied: 'Not yet',
    progress: 0,
    streak: 0,
    color: 'teal',
  },
]
