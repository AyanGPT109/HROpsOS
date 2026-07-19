import {
  LayoutDashboard,
  Building2,
  Factory,
  Shield,
  Users,
  LineChart,
  ScrollText,
  LifeBuoy,
  Settings,
} from 'lucide-react'
import { PortalLayout } from './portal-layout'
import type { NavItem } from './sidebar'

const items: NavItem[] = [
  { label: 'Dashboard', to: '/super-admin', icon: LayoutDashboard },
  { label: 'Tenants', to: '/super-admin/companies', icon: Building2 },
  { label: 'Sites', to: '/super-admin/plants', icon: Factory },
  { label: 'Platform Users', to: '/super-admin/admins', icon: Shield },
  { label: 'Workers', to: '/super-admin/workers', icon: Users },
  { label: 'Analytics', to: '/super-admin/analytics', icon: LineChart },
  { label: 'Audit Logs', to: '/super-admin/audit', icon: ScrollText },
  { label: 'Support Center', to: '/super-admin/support', icon: LifeBuoy },
  { label: 'Settings', to: '/super-admin/settings', icon: Settings },
]

export function SuperAdminLayout() {
  return (
    <PortalLayout items={items} title="HROpsOS" subtitle="Cloud Platform" />
  )
}
