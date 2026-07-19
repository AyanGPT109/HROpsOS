import type { AttendanceStatus } from '@/types'

/** Attendance thresholds in hours. */
export const PRESENT_HOURS = 8.5
export const HALF_DAY_HOURS = 4

/**
 * Derive attendance status from worked duration.
 * >= 8.5h Present | >= 4h Half Day | < 4h Absent
 */
export function statusFromWorkedMinutes(workedMinutes: number): AttendanceStatus {
  const hours = workedMinutes / 60
  if (hours >= PRESENT_HOURS) return 'present'
  if (hours >= HALF_DAY_HOURS) return 'half_day'
  return 'absent'
}

export function statusFromWorkedHours(hours: number): AttendanceStatus {
  return statusFromWorkedMinutes(Math.round(hours * 60))
}

export function computeWorkedMinutes(
  checkInAt: string | Date,
  checkOutAt: string | Date,
): number {
  const start = new Date(checkInAt).getTime()
  const end = new Date(checkOutAt).getTime()
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 0
  return Math.floor((end - start) / 60_000)
}

export function formatWorkedDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${String(m).padStart(2, '0')}m`
}

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Present',
  absent: 'Absent',
  half_day: 'Half Day',
  late: 'Late',
  on_leave: 'On Leave',
  checked_in: 'Checked In',
  checked_out: 'Checked Out',
  not_checked_in: 'Not Checked In',
}
