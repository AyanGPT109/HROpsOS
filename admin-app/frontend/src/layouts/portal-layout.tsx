import { Outlet } from 'react-router-dom'
import { Sidebar, type NavItem } from './sidebar'
import { Topbar } from './topbar'
import { CommandPalette } from '@/components/shared/command-palette'
import { PageHeader } from '@/components/shared/page-header'

interface PortalLayoutProps {
  items: NavItem[]
  title: string
  subtitle?: string
}

export function PortalLayout({ items, title, subtitle }: PortalLayoutProps) {
  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar items={items} title={title} subtitle={subtitle} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar mobileNav={items} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <CommandPalette items={items} />
    </div>
  )
}

export { PageHeader }
