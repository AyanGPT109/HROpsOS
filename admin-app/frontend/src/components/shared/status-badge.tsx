import type { AttendanceStatus, LeaveStatus } from '@/types'
import { Badge } from '@/components/ui/badge'
import { ATTENDANCE_STATUS_LABELS } from '@/utils/attendance'

const attendanceVariant: Record<
  AttendanceStatus,
  'success' | 'destructive' | 'warning' | 'default' | 'secondary' | 'outline' | 'info'
> = {
  present: 'success',
  absent: 'destructive',
  half_day: 'warning',
  late: 'warning',
  on_leave: 'info',
  checked_in: 'secondary',
  checked_out: 'default',
  not_checked_in: 'outline',
}

export function AttendanceStatusBadge({ status }: { status: AttendanceStatus }) {
  return (
    <Badge variant={attendanceVariant[status]}>
      {ATTENDANCE_STATUS_LABELS[status]}
    </Badge>
  )
}

const leaveVariant: Record<LeaveStatus, 'warning' | 'success' | 'destructive' | 'outline'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
  cancelled: 'outline',
}

export function LeaveStatusBadge({ status }: { status: LeaveStatus }) {
  return (
    <Badge variant={leaveVariant[status]} className="capitalize">
      {status}
    </Badge>
  )
}
