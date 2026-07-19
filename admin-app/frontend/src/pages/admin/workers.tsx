import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/data-table'
import { workerService } from '@/services/workerService'
import { useAuthStore } from '@/store/authStore'
import type { Worker } from '@/types'
import { isSupabaseConfigured } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { CreateWorkerDialog } from './create-worker-dialog'
import { EditWorkerDialog } from './edit-worker-dialog'
import { Pencil } from 'lucide-react'

export function AdminWorkersPage() {
  const companyId = useAuthStore((s) => s.profile?.company_id)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editWorker, setEditWorker] = useState<Worker | null>(null)

  const query = useQuery({
    queryKey: ['workers', companyId, search],
    queryFn: () =>
      workerService.list({
        companyId: companyId!,
        search: search || undefined,
        pageSize: 50,
      }),
    enabled: Boolean(companyId) && isSupabaseConfigured,
  })

  const columns = useMemo<ColumnDef<Worker, unknown>[]>(
    () => [
      {
        header: 'Employee',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">
              {row.original.profile?.full_name ?? '—'}
            </p>
            <p className="text-xs text-muted-foreground">{row.original.employee_id}</p>
          </div>
        ),
      },
      {
        header: 'Plant',
        cell: ({ row }) => row.original.plant?.name ?? 'Unassigned',
      },
      {
        header: 'Department',
        cell: ({ row }) => row.original.department ?? '—',
      },
      {
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? 'success' : 'outline'}>
            {row.original.is_active ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" title="Edit worker" onClick={() => setEditWorker(row.original)}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button size="sm" variant="outline" onClick={async () => {
              try {
                await workerService.deactivate(row.original.id)
                toast.success('Worker deactivated')
                void query.refetch()
              } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed')
              }
            }}>Deactivate</Button>
          </div>
        ),
      },
    ],
    [query],
  )

  return (
    <div>
      <PageHeader
        title="Workers"
        description="Search, manage, and assign plant workforce."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            Add worker
          </Button>
        }
      />
      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search by employee ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Card className="overflow-hidden">
        <DataTable
          columns={columns}
          data={query.data?.data ?? []}
          loading={query.isLoading}
          emptyTitle="No workers"
          emptyDescription="Add workers to start tracking attendance."
        />
      </Card>
      <CreateWorkerDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => void query.refetch()}
      />
      <EditWorkerDialog worker={editWorker} onClose={() => setEditWorker(null)} onSaved={() => void query.refetch()} />
    </div>
  )
}
