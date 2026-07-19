import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ColumnDef } from '@tanstack/react-table'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Dialog } from '@/components/ui/dialog'
import { DataTable } from '@/components/shared/data-table'
import { LeaveStatusBadge } from '@/components/shared/status-badge'
import { leaveService } from '@/services/leaveService'
import type { LeaveRequest, LeaveType } from '@/types'
import { formatDate } from '@/utils/date'
import { isSupabaseConfigured } from '@/lib/supabaseClient'

const schema = z.object({
  leave_type: z.string().min(1),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
  reason: z.string().min(5, 'Please provide a reason'),
})

type FormValues = z.infer<typeof schema>

const leaveOptions = [
  { value: 'casual', label: 'Casual' },
  { value: 'sick', label: 'Sick' },
  { value: 'earned', label: 'Earned' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'compensatory', label: 'Compensatory' },
  { value: 'other', label: 'Other' },
]

const columns: ColumnDef<LeaveRequest, unknown>[] = [
  {
    accessorKey: 'leave_type',
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
    accessorKey: 'reason',
    header: 'Reason',
    cell: ({ row }) => (
      <span className="line-clamp-1 max-w-[200px]">{row.original.reason}</span>
    ),
  },
]

export function WorkerLeavesPage() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const listQuery = useQuery({
    queryKey: ['leaves', 'mine'],
    queryFn: () => leaveService.myLeaves(),
    enabled: isSupabaseConfigured,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { leave_type: 'casual' },
  })

  const submit = useMutation({
    mutationFn: async (values: FormValues) => {
      const days =
        differenceInCalendarDays(parseISO(values.end_date), parseISO(values.start_date)) + 1
      return leaveService.submit({
        leave_type: values.leave_type as LeaveType,
        start_date: values.start_date,
        end_date: values.end_date,
        reason: values.reason,
        days_count: Math.max(days, 1),
      })
    },
    onSuccess: () => {
      toast.success('Leave request submitted')
      setOpen(false)
      reset()
      void queryClient.invalidateQueries({ queryKey: ['leaves'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <div>
      <PageHeader
        title="Leaves"
        description="Submit and track leave requests."
        actions={
          <Button onClick={() => setOpen(true)}>Request leave</Button>
        }
      />
      <Card className="overflow-hidden">
        <DataTable
          columns={columns}
          data={listQuery.data?.data ?? []}
          loading={listQuery.isLoading}
          emptyTitle="No leave requests"
          emptyDescription="Submit a leave request to get started."
        />
      </Card>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Request leave"
        description="Your admin will review this request."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button loading={submit.isPending} onClick={handleSubmit((v) => submit.mutate(v))}>
              Submit
            </Button>
          </>
        }
      >
        <form className="space-y-3">
          <Select
            label="Leave type"
            options={leaveOptions}
            error={errors.leave_type?.message}
            {...register('leave_type')}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Start date"
              type="date"
              error={errors.start_date?.message}
              {...register('start_date')}
            />
            <Input
              label="End date"
              type="date"
              error={errors.end_date?.message}
              {...register('end_date')}
            />
          </div>
          <Textarea
            label="Reason"
            error={errors.reason?.message}
            {...register('reason')}
          />
        </form>
      </Dialog>
    </div>
  )
}
