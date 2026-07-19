import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/shared/data-table'
import { adminService } from '@/services/adminService'
import type { AuditLog } from '@/types'
import { formatDateTime } from '@/utils/date'
import { isSupabaseConfigured } from '@/lib/supabaseClient'

const columns: ColumnDef<AuditLog, unknown>[] = [
  {
    accessorKey: 'action',
    header: 'Action',
  },
  {
    accessorKey: 'entity_type',
    header: 'Entity',
  },
  {
    accessorKey: 'entity_id',
    header: 'Entity ID',
    cell: ({ row }) => row.original.entity_id?.slice(0, 8) ?? '—',
  },
  {
    header: 'When',
    cell: ({ row }) => formatDateTime(row.original.created_at),
  },
]

export function SuperAdminAuditPage() {
  const query = useQuery({
    queryKey: ['sa', 'audit'],
    queryFn: () => adminService.listAuditLogs({ pageSize: 50 }),
    enabled: isSupabaseConfigured,
  })

  return (
    <div>
      <PageHeader title="Audit Logs" description="Security and change history." />
      <Card className="overflow-hidden">
        <DataTable
          columns={columns}
          data={query.data?.data ?? []}
          loading={query.isLoading}
          emptyTitle="No audit events"
        />
      </Card>
    </div>
  )
}
