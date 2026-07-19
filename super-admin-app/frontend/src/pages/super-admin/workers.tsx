import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { DataTable } from '@/components/shared/data-table'
import { Badge } from '@/components/ui/badge'
import { adminService } from '@/services/adminService'
import { workerService } from '@/services/workerService'
import type { Worker } from '@/types'
import { isSupabaseConfigured } from '@/lib/supabaseClient'

const columns: ColumnDef<Worker, unknown>[] = [
  {
    header: 'Worker',
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.profile?.full_name ?? '—'}</p>
        <p className="text-xs text-muted-foreground">{row.original.employee_id}</p>
      </div>
    ),
  },
  {
    header: 'Plant',
    cell: ({ row }) => row.original.plant?.name ?? '—',
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

export function SuperAdminWorkersPage() {
  const companies = useQuery({
    queryKey: ['sa', 'companies'],
    queryFn: () => adminService.listCompanies({ pageSize: 100 }),
    enabled: isSupabaseConfigured,
  })
  const [companyId, setCompanyId] = useState('')

  useEffect(() => {
    if (!companyId && companies.data?.data[0]) {
      setCompanyId(companies.data.data[0].id)
    }
  }, [companyId, companies.data])

  const workers = useQuery({
    queryKey: ['sa', 'workers', companyId],
    queryFn: () => workerService.list({ companyId, pageSize: 100 }),
    enabled: Boolean(companyId) && isSupabaseConfigured,
  })

  return (
    <div>
      <PageHeader title="Workers" description="All workers across companies." />
      <div className="mb-4 max-w-sm">
        <Select
          label="Company"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          placeholder="Select company"
          options={(companies.data?.data ?? []).map((c) => ({
            value: c.id,
            label: c.name,
          }))}
        />
      </div>
      <Card className="overflow-hidden">
        <DataTable
          columns={columns}
          data={workers.data?.data ?? []}
          loading={workers.isLoading}
          emptyTitle="Select a company"
        />
      </Card>
    </div>
  )
}
