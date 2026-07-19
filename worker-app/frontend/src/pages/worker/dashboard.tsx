import { Link } from 'react-router-dom'
import {
  Clock,
  LogIn,
  LogOut,
  CalendarDays,
  History,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/page-header'
import { KpiCard } from '@/components/shared/kpi-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { AttendanceStatusBadge } from '@/components/shared/status-badge'
import { useAuthStore } from '@/store/authStore'
import { useCheckInOut, useTodayAttendance } from '@/hooks/useAttendance'
import { greetingForNow, formatTime } from '@/utils/date'
import { formatWorkedDuration } from '@/utils/attendance'
import { Skeleton } from '@/components/ui/skeleton'

export function WorkerDashboardPage() {
  const profile = useAuthStore((s) => s.profile)
  const { data: today, isLoading } = useTodayAttendance()
  const { checkIn, checkOut, isBusy } = useCheckInOut()

  const canCheckIn = !today?.check_in_at || Boolean(today.check_out_at)
  const canCheckOut = Boolean(today?.check_in_at && !today?.check_out_at)

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greetingForNow()}, ${profile?.full_name?.split(' ')[0] ?? 'there'}`}
        description="Here’s your attendance overview for today."
        actions={
          <Avatar name={profile?.full_name ?? 'User'} src={profile?.avatar_url} size="lg" />
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Status"
          value={today?.status ? today.status.replace('_', ' ') : '—'}
          icon={CheckCircle2}
          accent="secondary"
        />
        <KpiCard
          title="Working Hours"
          value={today ? formatWorkedDuration(today.worked_minutes) : '0h 00m'}
          icon={Clock}
          accent="primary"
        />
        <KpiCard
          title="Check In"
          value={today?.check_in_at ? formatTime(today.check_in_at) : '—'}
          icon={LogIn}
          accent="success"
        />
        <KpiCard
          title="Check Out"
          value={today?.check_out_at ? formatTime(today.check_out_at) : '—'}
          icon={LogOut}
          accent="warning"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today&apos;s attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  {today ? (
                    <AttendanceStatusBadge status={today.status} />
                  ) : (
                    <span className="text-sm text-muted-foreground">Not checked in yet</span>
                  )}
                  {today?.is_late && (
                    <span className="inline-flex items-center gap-1 text-xs text-warning-foreground">
                      <AlertCircle className="h-3.5 w-3.5" /> Late
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    variant="success"
                    disabled={!canCheckIn || isBusy}
                    loading={checkIn.isPending}
                    onClick={() => checkIn.mutate()}
                  >
                    <LogIn className="h-4 w-4" /> Check In
                  </Button>
                  <Button
                    size="lg"
                    variant="default"
                    disabled={!canCheckOut || isBusy}
                    loading={checkOut.isPending}
                    onClick={() => checkOut.mutate()}
                  >
                    <LogOut className="h-4 w-4" /> Check Out
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Check-in requires internet, GPS permission, and being inside your plant geofence.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {[
              { to: '/worker/leaves', label: 'Request Leave', icon: CalendarDays },
              { to: '/worker/history', label: 'Attendance History', icon: History },
              { to: '/worker/schedule', label: 'Today’s Schedule', icon: Clock },
            ].map((a) => (
              <motion.div key={a.to} whileHover={{ x: 2 }}>
                <Link
                  to={a.to}
                  className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-medium transition hover:bg-muted/50"
                >
                  <a.icon className="h-4 w-4 text-primary" />
                  {a.label}
                </Link>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
