import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  MapPin,
  CalendarRange,
  FileBarChart,
  Bell,
  Settings,
} from 'lucide-react'
import { PortalLayout } from './portal-layout'
import type { NavItem } from './sidebar'

const items: NavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Workforce', to: '/admin/workers', icon: Users },
  { label: 'Attendance', to: '/admin/attendance', icon: Clock },
  { label: 'Leave', to: '/admin/leaves', icon: CalendarDays },
  { label: 'Site Operations', to: '/admin/geo-logs', icon: MapPin },
  { label: 'Schedules', to: '/admin/schedules', icon: CalendarRange },
  { label: 'Reports', to: '/admin/reports', icon: FileBarChart },
  { label: 'Notifications', to: '/admin/notifications', icon: Bell },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
]

export function AdminLayout() {
  return <PortalLayout items={items} title="HROpsOS" subtitle="Tenant Workspace" />
}
