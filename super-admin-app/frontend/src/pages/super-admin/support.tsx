import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/data-table'
import { adminService } from '@/services/adminService'
import type { SupportTicket } from '@/types'
import { formatDateTime } from '@/utils/date'
import { isSupabaseConfigured } from '@/lib/supabaseClient'

const columns: ColumnDef<SupportTicket, unknown>[] = [
  {
    accessorKey: 'subject',
    header: 'Subject',
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.priority === 'critical' || row.original.priority === 'high'
            ? 'destructive'
            : 'outline'
        }
        className="capitalize"
      >
        {row.original.priority}
      </Badge>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge className="capitalize">{row.original.status.replace('_', ' ')}</Badge>
    ),
  },
  {
    header: 'Created',
    cell: ({ row }) => formatDateTime(row.original.created_at),
  },
]

export function SuperAdminSupportPage() {
  const query = useQuery({
    queryKey: ['sa', 'support'],
    queryFn: () => adminService.listTickets({ pageSize: 50 }),
    enabled: isSupabaseConfigured,
  })

  return (
    <div>
      <PageHeader title="Support" description="Support tickets across tenants." />
      <Card className="overflow-hidden">
        <DataTable
          columns={columns}
          data={query.data?.data ?? []}
          loading={query.isLoading}
          emptyTitle="No tickets"
        />
      </Card>
    </div>
  )
}
