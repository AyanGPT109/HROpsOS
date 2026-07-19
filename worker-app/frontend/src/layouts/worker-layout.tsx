import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  ClipboardList,
  Bell,
  User,
  Settings,
} from 'lucide-react'
import { PortalLayout } from './portal-layout'
import type { NavItem } from './sidebar'

const items: NavItem[] = [
  { label: 'Dashboard', to: '/worker', icon: LayoutDashboard },
  { label: 'My Shift', to: '/worker/schedule', icon: CalendarDays },
  { label: 'My Attendance', to: '/worker/attendance', icon: Clock },
  { label: 'Attendance History', to: '/worker/history', icon: ClipboardList },
  { label: 'Leave', to: '/worker/leaves', icon: CalendarDays },
  { label: 'Notifications', to: '/worker/notifications', icon: Bell },
  { label: 'Profile', to: '/worker/profile', icon: User },
  { label: 'Settings', to: '/worker/settings', icon: Settings },
]

export function WorkerLayout() {
  return <PortalLayout items={items} title="HROpsOS" subtitle="Employee Experience" />
}
