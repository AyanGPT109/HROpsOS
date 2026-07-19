import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/shared/data-table'
import { AttendanceStatusBadge } from '@/components/shared/status-badge'
import { attendanceService } from '@/services/attendanceService'
import { useAuthStore } from '@/store/authStore'
import type { Attendance } from '@/types'
import { formatTime } from '@/utils/date'
import { formatWorkedDuration } from '@/utils/attendance'
import { isSupabaseConfigured } from '@/lib/supabaseClient'

const columns: ColumnDef<Attendance, unknown>[] = [
  {
    header: 'Worker',
    cell: ({ row }) =>
      row.original.worker?.profile?.full_name ??
      row.original.worker?.employee_id ??
      '—',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <AttendanceStatusBadge status={row.original.status} />,
  },
  {
    header: 'Check In',
    cell: ({ row }) =>
      row.original.check_in_at ? formatTime(row.original.check_in_at) : '—',
  },
  {
    header: 'Check Out',
    cell: ({ row }) =>
      row.original.check_out_at ? formatTime(row.original.check_out_at) : '—',
  },
  {
    header: 'Hours',
    cell: ({ row }) => formatWorkedDuration(row.original.worked_minutes),
  },
]

export function AdminAttendancePage() {
  const companyId = useAuthStore((s) => s.profile?.company_id)
  const query = useQuery({
    queryKey: ['admin', 'attendance', companyId],
    queryFn: () => attendanceService.getCompanyToday(companyId!),
    enabled: Boolean(companyId) && isSupabaseConfigured,
  })

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Daily attendance across your company."
      />
      <Card className="overflow-hidden">
        <DataTable
          columns={columns}
          data={query.data ?? []}
          loading={query.isLoading}
          emptyTitle="No records"
          emptyDescription="Attendance for today will show up here."
        />
      </Card>
    </div>
  )
}
