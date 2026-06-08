import type { LucideIcon } from 'lucide-react'
import type { View } from '../types/navigation'
import { LayoutDashboard, BookOpen, GraduationCap, Settings } from 'lucide-react'

export interface NavItem {
  icon: LucideIcon
  label: string
  view: View
}

export const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', view: 'dashboard' },
  { icon: BookOpen, label: 'Study Capsules', view: 'capsules' },
  { icon: GraduationCap, label: 'Exams', view: 'dashboard' },
  { icon: Settings, label: 'Settings', view: 'dashboard' },
]
