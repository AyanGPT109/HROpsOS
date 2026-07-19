import { LogIn, LogOut, MapPin } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AttendanceStatusBadge } from '@/components/shared/status-badge'
import { useCheckInOut, useTodayAttendance } from '@/hooks/useAttendance'
import { formatDateTime, formatTime } from '@/utils/date'
import { formatWorkedDuration } from '@/utils/attendance'
import { Skeleton } from '@/components/ui/skeleton'

export function WorkerAttendancePage() {
  const { data: today, isLoading } = useTodayAttendance()
  const { checkIn, checkOut, isBusy, locating } = useCheckInOut()

  const canCheckIn = !today?.check_in_at || Boolean(today.check_out_at)
  const canCheckOut = Boolean(today?.check_in_at && !today?.check_out_at)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Check in and out within your plant geofence."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Check in / out</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li>1. Verify internet connection</li>
              <li>2. Allow GPS / location permission</li>
              <li>3. Fetch GPS coordinates & accuracy</li>
              <li>4. Validate plant geofence radius</li>
              <li>5. Record attendance</li>
            </ol>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                variant="success"
                disabled={!canCheckIn || isBusy}
                loading={checkIn.isPending || (locating && canCheckIn)}
                onClick={() => checkIn.mutate()}
              >
                <LogIn className="h-4 w-4" /> Check In
              </Button>
              <Button
                size="lg"
                disabled={!canCheckOut || isBusy}
                loading={checkOut.isPending || (locating && canCheckOut)}
                onClick={() => checkOut.mutate()}
              >
                <LogOut className="h-4 w-4" /> Check Out
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : !today ? (
              <p className="text-sm text-muted-foreground">No attendance record yet today.</p>
            ) : (
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <AttendanceStatusBadge status={today.status} />
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Check in</dt>
                  <dd>{today.check_in_at ? formatTime(today.check_in_at) : '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Check out</dt>
                  <dd>{today.check_out_at ? formatTime(today.check_out_at) : '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Worked</dt>
                  <dd className="font-semibold">{formatWorkedDuration(today.worked_minutes)}</dd>
                </div>
                {(today.check_in_lat != null || today.check_out_lat != null) && (
                  <div className="flex items-start justify-between gap-4">
                    <dt className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> Location
                    </dt>
                    <dd className="text-right text-xs">
                      {today.check_in_lat != null && (
                        <div>
                          In: {today.check_in_lat.toFixed(5)}, {today.check_in_lon?.toFixed(5)}
                        </div>
                      )}
                      {today.check_out_lat != null && (
                        <div>
                          Out: {today.check_out_lat.toFixed(5)}, {today.check_out_lon?.toFixed(5)}
                        </div>
                      )}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Updated</dt>
                  <dd>{formatDateTime(today.updated_at)}</dd>
                </div>
              </dl>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
