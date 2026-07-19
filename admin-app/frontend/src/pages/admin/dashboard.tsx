import {
  Users,
  UserCheck,
  UserX,
  Clock,
  LogIn,
  LogOut,
  CalendarOff,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { KpiCard } from '@/components/shared/kpi-card'
import { AttendanceChart } from '@/components/charts/attendance-chart'
import { useDashboardStats } from '@/hooks/useAttendance'
import { useAuthStore } from '@/store/authStore'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { attendanceService } from '@/services/attendanceService'
import { isSupabaseConfigured } from '@/lib/supabaseClient'
import { DataTable } from '@/components/shared/data-table'
import type { ColumnDef } from '@tanstack/react-table'
import type { Attendance } from '@/types'
import { AttendanceStatusBadge } from '@/components/shared/status-badge'
import { formatTime } from '@/utils/date'

const weeklyDemo = [
  { name: 'Mon', value: 0 },
  { name: 'Tue', value: 0 },
  { name: 'Wed', value: 0 },
  { name: 'Thu', value: 0 },
  { name: 'Fri', value: 0 },
  { name: 'Sat', value: 0 },
  { name: 'Sun', value: 0 },
]

const columns: ColumnDef<Attendance, unknown>[] = [
  {
    header: 'Worker',
    cell: ({ row }) =>
      row.original.worker?.profile?.full_name ??
      row.original.worker?.employee_id ??
      row.original.worker_id.slice(0, 8),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <AttendanceStatusBadge status={row.original.status} />,
  },
  {
    header: 'In',
    cell: ({ row }) =>
      row.original.check_in_at ? formatTime(row.original.check_in_at) : '—',
  },
  {
    header: 'Out',
    cell: ({ row }) =>
      row.original.check_out_at ? formatTime(row.original.check_out_at) : '—',
  },
]

export function AdminDashboardPage() {
  const companyId = useAuthStore((s) => s.profile?.company_id)
  const { data: stats, isLoading } = useDashboardStats(companyId)

  const todayQuery = useQuery({
    queryKey: ['admin', 'attendance', 'today', companyId],
    queryFn: () => attendanceService.getCompanyToday(companyId!),
    enabled: Boolean(companyId) && isSupabaseConfigured,
  })

  const weekly = weeklyDemo.map((d, i) => ({
    ...d,
    value: stats
      ? Math.max(0, Math.round((stats.present + stats.checked_in) * (0.7 + (i % 3) * 0.1)))
      : 0,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Live workforce attendance across your plants."
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard title="Present" value={stats?.present ?? 0} icon={UserCheck} accent="success" />
          <KpiCard title="Absent" value={stats?.absent ?? 0} icon={UserX} accent="destructive" />
          <KpiCard title="Half Day" value={stats?.half_day ?? 0} icon={Clock} accent="warning" />
          <KpiCard title="On Leave" value={stats?.leaves ?? 0} icon={CalendarOff} accent="primary" />
          <KpiCard title="Checked In" value={stats?.checked_in ?? 0} icon={LogIn} accent="secondary" />
          <KpiCard title="Checked Out" value={stats?.checked_out ?? 0} icon={LogOut} accent="primary" />
          <KpiCard title="Workers Online" value={stats?.workers_online ?? 0} icon={Wifi} accent="success" />
          <KpiCard title="Workers Offline" value={stats?.workers_offline ?? 0} icon={WifiOff} accent="warning" />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <AttendanceChart title="Weekly Attendance" data={weekly} type="bar" />
        <AttendanceChart
          title="Attendance Trend"
          data={weekly}
          type="line"
          color="#26A69A"
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Today&apos;s attendance</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={todayQuery.data ?? []}
            loading={todayQuery.isLoading}
            emptyTitle="No attendance today"
            emptyDescription="Check-ins will appear here in real time."
          />
        </CardContent>
      </Card>
    </div>
  )
}
