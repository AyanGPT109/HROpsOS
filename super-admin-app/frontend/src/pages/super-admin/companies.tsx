import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/data-table'
import { adminService } from '@/services/adminService'
import type { Company } from '@/types'
import { isSupabaseConfigured } from '@/lib/supabaseClient'

const schema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  email: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const columns: ColumnDef<Company, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Company',
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.code}</p>
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => row.original.email ?? '—',
  },
  {
    accessorKey: 'subscription_plan',
    header: 'Plan',
    cell: ({ row }) => row.original.subscription_plan ?? 'standard',
  },
  {
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? 'success' : 'outline'}>
        {row.original.is_active ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
]

export function SuperAdminCompaniesPage() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['sa', 'companies'],
    queryFn: () => adminService.listCompanies({ pageSize: 100 }),
    enabled: isSupabaseConfigured,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const create = useMutation({
    mutationFn: (values: FormValues) =>
      adminService.createCompany({
        name: values.name,
        code: values.code,
        email: values.email || null,
        is_active: true,
      }),
    onSuccess: () => {
      toast.success('Company created')
      setOpen(false)
      reset()
      void queryClient.invalidateQueries({ queryKey: ['sa', 'companies'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <div>
      <PageHeader
        title="Companies"
        description="Manage tenant companies on the platform."
        actions={<Button onClick={() => setOpen(true)}>Add company</Button>}
      />
      <Card className="overflow-hidden">
        <DataTable
          columns={columns}
          data={query.data?.data ?? []}
          loading={query.isLoading}
          emptyTitle="No companies"
        />
      </Card>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Create company"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={create.isPending}
              onClick={handleSubmit((v) => create.mutate(v))}
            >
              Create
            </Button>
          </>
        }
      >
        <form className="space-y-3">
          <Input label="Name" error={errors.name?.message} {...register('name')} />
          <Input label="Code" error={errors.code?.message} {...register('code')} />
          <Input label="Email" error={errors.email?.message} {...register('email')} />
        </form>
      </Dialog>
    </div>
  )
}
