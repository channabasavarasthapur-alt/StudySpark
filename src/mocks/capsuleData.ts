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
  'Building revision points...',
  'Finding important terms...',
  'Writing practice questions...',
  'Almost done...',
]

export const sampleCapsule: CapsuleData = {
  topic: 'Quantum Entanglement',
  summary:
    'Quantum entanglement describes linked particle states where measuring one particle helps predict the state of another, even when separated by distance.',
  concepts: ["Bell's Theorem", 'Wave Collapse', 'Qubits'],
  formulas: ['|psi> = alpha|0> + beta|1>', 'E = h * frequency'],
  tips: ['Use a two-column diagram to compare each particle state.', 'Review why entanglement creates correlation, not faster-than-light messaging.'],
  time: '25m',
  difficulty: 'Hard',
  icon: Atom,
}

export const capsuleInsights: InsightCardData[] = [
  {
    label: 'Study Score',
    value: '--',
    icon: Brain,
    description: 'A score appears after a completed study session.',
    color: 'purple',
    progress: 0,
  },
  {
    label: 'Understanding',
    value: 'High',
    icon: BarChart3,
    description: 'Core ideas are organized for quick review.',
    color: 'teal',
    progress: 88,
  },
  {
    label: 'Revision',
    value: 'Low',
    icon: AlertCircle,
    description: 'Schedule revision after the first study pass.',
    color: 'teal',
    progress: 12,
  },
  {
    label: 'Status',
    value: 'Saved',
    icon: CheckCircle2,
    description: 'Capsule is ready for your study history.',
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
