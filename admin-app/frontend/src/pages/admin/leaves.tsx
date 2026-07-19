import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { DataTable } from '@/components/shared/data-table'
import { LeaveStatusBadge } from '@/components/shared/status-badge'
import { adminService } from '@/services/adminService'
import { useAuthStore } from '@/store/authStore'
import type { LeaveRequest, LeaveStatus } from '@/types'
import { formatDate } from '@/utils/date'
import { isSupabaseConfigured } from '@/lib/supabaseClient'

export function AdminLeavesPage() {
  const companyId = useAuthStore((s) => s.profile?.company_id)
  const [status, setStatus] = useState<LeaveStatus | ''>('pending')
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['admin', 'leaves', companyId, status],
    queryFn: () =>
      adminService.listLeaves({
        companyId: companyId!,
        status: status || undefined,
      }),
    enabled: Boolean(companyId) && isSupabaseConfigured,
  })

  const review = useMutation({
    mutationFn: ({
      id,
      decision,
    }: {
      id: string
      decision: 'approved' | 'rejected'
    }) => adminService.reviewLeave(id, decision),
    onSuccess: (_, vars) => {
      toast.success(`Leave ${vars.decision}`)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'leaves'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const columns: ColumnDef<LeaveRequest, unknown>[] = [
    {
      header: 'Worker',
      cell: ({ row }) =>
        row.original.worker?.profile?.full_name ??
        row.original.worker?.employee_id ??
        '—',
    },
    {
      header: 'Type',
      cell: ({ row }) => <span className="capitalize">{row.original.leave_type}</span>,
    },
    {
      header: 'Period',
      cell: ({ row }) =>
        `${formatDate(row.original.start_date)} – ${formatDate(row.original.end_date)}`,
    },
    {
      accessorKey: 'days_count',
      header: 'Days',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <LeaveStatusBadge status={row.original.status} />,
    },
    {
      header: 'Actions',
      cell: ({ row }) =>
        row.original.status === 'pending' ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="success"
              loading={review.isPending}
              onClick={() =>
                review.mutate({ id: row.original.id, decision: 'approved' })
              }
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              loading={review.isPending}
              onClick={() =>
                review.mutate({ id: row.original.id, decision: 'rejected' })
              }
            >
              Reject
            </Button>
          </div>
        ) : (
          '—'
        ),
    },
  ]

  return (
    <div>
      <PageHeader title="Leaves" description="Approve or reject leave requests." />
      <div className="mb-4 max-w-xs">
        <Select
          label="Filter status"
          value={status}
          onChange={(e) => setStatus(e.target.value as LeaveStatus | '')}
          options={[
            { value: '', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
        />
      </div>
      <Card className="overflow-hidden">
        <DataTable
          columns={columns}
          data={query.data?.data ?? []}
          loading={query.isLoading}
          emptyTitle="No leave requests"
        />
      </Card>
    </div>
  )
}
