import { Bell, Menu, Moon, Search, Sun, LogOut, User } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Sheet } from '@/components/ui/sheet'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'
import { useNotifications } from '@/hooks/useNotifications'
import { relativeTime } from '@/utils/date'
import { useState } from 'react'
import type { NavItem } from './sidebar'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface TopbarProps {
  mobileNav: NavItem[]
}

export function Topbar({ mobileNav }: TopbarProps) {
  const profile = useAuthStore((s) => s.profile)
  const logout = useAuthStore((s) => s.logout)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const setCommandOpen = useUiStore((s) => s.setCommandOpen)
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [notifOpen, setNotifOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-md md:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="hidden md:inline-flex" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>

        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="hidden h-10 max-w-sm flex-1 items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 text-sm text-muted-foreground transition hover:bg-muted sm:flex"
        >
          <Search className="h-4 w-4" />
          <span>Search…</span>
          <kbd className="ml-auto rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium">
            ⌘K
          </kbd>
        </button>

        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setNotifOpen(true)}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-muted"
            >
              <Avatar
                name={profile?.full_name ?? 'User'}
                src={profile?.avatar_url}
                size="sm"
              />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-elevated">
                  <div className="border-b border-border px-3 py-2">
                    <p className="text-sm font-semibold">{profile?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{profile?.email}</p>
                  </div>
                  <button
                    type="button"
                    className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => {
                      setMenuOpen(false)
                      navigate('/worker/profile')
                    }}
                  >
                    <User className="h-4 w-4" /> Profile
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                    onClick={async () => {
                      setMenuOpen(false)
                      await logout()
                      navigate('/login')
                    }}
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <Sheet open={notifOpen} onOpenChange={setNotifOpen} title="Notifications" description="Latest updates">
        <div className="mb-3 flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => void markAllAsRead()}>
            Mark all read
          </Button>
        </div>
        <div className="space-y-2">
          {notifications.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </p>
          )}
          {notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => void markAsRead(n.id)}
              className={cn(
                'w-full rounded-xl border border-border p-3 text-left transition hover:bg-muted/50',
                !n.is_read && 'border-primary/30 bg-primary/5',
              )}
            >
              <p className="text-sm font-semibold">{n.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {relativeTime(n.created_at)}
              </p>
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen} side="left" title="Menu">
        <nav className="space-y-1">
          {mobileNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                  isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted',
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </Sheet>
    </>
  )
}
