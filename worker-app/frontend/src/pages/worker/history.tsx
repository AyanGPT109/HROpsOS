import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/shared/data-table'
import { AttendanceStatusBadge } from '@/components/shared/status-badge'
import { useAttendanceHistory } from '@/hooks/useAttendance'
import type { Attendance } from '@/types'
import { formatDate, formatTime } from '@/utils/date'
import { formatWorkedDuration } from '@/utils/attendance'
import { useAuthStore } from '@/store/authStore'
import { useQuery } from '@tanstack/react-query'
import { workerService } from '@/services/workerService'
import { isSupabaseConfigured } from '@/lib/supabaseClient'

const columns: ColumnDef<Attendance, unknown>[] = [
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => formatDate(row.original.date),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <AttendanceStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'check_in_at',
    header: 'Check In',
    cell: ({ row }) =>
      row.original.check_in_at ? formatTime(row.original.check_in_at) : '—',
  },
  {
    accessorKey: 'check_out_at',
    header: 'Check Out',
    cell: ({ row }) =>
      row.original.check_out_at ? formatTime(row.original.check_out_at) : '—',
  },
  {
    accessorKey: 'worked_minutes',
    header: 'Hours',
    cell: ({ row }) => formatWorkedDuration(row.original.worked_minutes),
  },
]

export function WorkerHistoryPage() {
  const userId = useAuthStore((s) => s.user?.id)
  const workerQuery = useQuery({
    queryKey: ['worker', 'me', userId],
    queryFn: () => workerService.getByUserId(userId!),
    enabled: Boolean(userId) && isSupabaseConfigured,
  })

  const history = useAttendanceHistory({
    workerId: workerQuery.data?.id,
    page: 1,
    pageSize: 50,
  })

  return (
    <div>
      <PageHeader
        title="Attendance History"
        description="Past check-ins, check-outs, and daily status."
      />
      <Card className="overflow-hidden">
        <DataTable
          columns={columns}
          data={history.data?.data ?? []}
          loading={history.isLoading || workerQuery.isLoading}
          emptyTitle="No history yet"
          emptyDescription="Your attendance records will appear here."
        />
      </Card>
    </div>
  )
}
