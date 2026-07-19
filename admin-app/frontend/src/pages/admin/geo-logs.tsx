import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/data-table'
import { attendanceService } from '@/services/attendanceService'
import { useAuthStore } from '@/store/authStore'
import type { AttendanceLog } from '@/types'
import { formatDateTime } from '@/utils/date'
import { isSupabaseConfigured } from '@/lib/supabaseClient'

const columns: ColumnDef<AttendanceLog, unknown>[] = [
  {
    header: 'Worker',
    cell: ({ row }) =>
      row.original.worker?.profile?.full_name ??
      row.original.worker?.employee_id ??
      '—',
  },
  {
    accessorKey: 'event_type',
    header: 'Event',
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.event_type === 'geo_exit'
            ? 'destructive'
            : row.original.event_type === 'geo_return'
              ? 'success'
              : 'outline'
        }
      >
        {row.original.event_type.replace('_', ' ')}
      </Badge>
    ),
  },
  {
    header: 'Coordinates',
    cell: ({ row }) =>
      `${row.original.latitude.toFixed(5)}, ${row.original.longitude.toFixed(5)}`,
  },
  {
    header: 'Distance',
    cell: ({ row }) =>
      row.original.distance_from_fence != null
        ? `${Math.round(row.original.distance_from_fence)} m`
        : '—',
  },
  {
    header: 'Time',
    cell: ({ row }) => formatDateTime(row.original.created_at),
  },
]

export function AdminGeoLogsPage() {
  const companyId = useAuthStore((s) => s.profile?.company_id)
  const [eventType, setEventType] = useState('')

  const query = useQuery({
    queryKey: ['admin', 'geo-logs', companyId, eventType],
    queryFn: () =>
      attendanceService.getGeoLogs({
        companyId: companyId!,
        eventType: eventType || undefined,
      }),
    enabled: Boolean(companyId) && isSupabaseConfigured,
  })

  return (
    <div>
      <PageHeader
        title="Geo Logs"
        description="Geofence exits, returns, and location heartbeats."
      />
      <div className="mb-4 max-w-xs">
        <Select
          label="Event type"
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          options={[
            { value: '', label: 'All events' },
            { value: 'geo_exit', label: 'Exit' },
            { value: 'geo_return', label: 'Return' },
            { value: 'check_in', label: 'Check In' },
            { value: 'check_out', label: 'Check Out' },
            { value: 'heartbeat', label: 'Heartbeat' },
          ]}
        />
      </div>
      <Card className="overflow-hidden">
        <DataTable
          columns={columns}
          data={query.data?.data ?? []}
          loading={query.isLoading}
          emptyTitle="No geo events"
          emptyDescription="Exit and return events will appear when workers leave or re-enter the fence."
        />
      </Card>
    </div>
  )
}
