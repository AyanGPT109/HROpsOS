import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import {
  Eye,
  Pencil,
  Trash2,
  RotateCcw,
  MapPinned,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/data-table'
import { PlantFormDialog } from '@/features/plants/components/plant-form-dialog'
import { ViewPlantDialog } from '@/features/plants/components/view-plant-dialog'
import { ConfirmActionDialog } from '@/features/plants/components/confirm-action-dialog'
import {
  useCompaniesForPlants,
  usePlants,
  useSoftDeletePlant,
  useRestorePlant,
} from '@/features/plants/hooks/usePlants'
import { TIMEZONE_OPTIONS } from '@/features/plants/schemas/plantSchema'
import type { Plant } from '@/types'
import { formatDate } from '@/utils/date'

type ConfirmKind = 'delete' | 'restore' | 'geofence-prompt' | null

export function SuperAdminPlantsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [timezone, setTimezone] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [formOpen, setFormOpen] = useState(false)
  const [editPlant, setEditPlant] = useState<Plant | null>(null)
  const [viewId, setViewId] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<{
    kind: ConfirmKind
    plant: Plant | null
    plantId?: string
  }>({ kind: null, plant: null })

  const companies = useCompaniesForPlants()
  const list = usePlants({
    companyId: companyId || undefined,
    search: search || undefined,
    status,
    timezone: timezone || undefined,
    page,
    pageSize,
  })

  const softDelete = useSoftDeletePlant()
  const restore = useRestorePlant()
  const totalPages = Math.max(1, Math.ceil((list.data?.count ?? 0) / pageSize))

  const columns = useMemo<ColumnDef<Plant, unknown>[]>(
    () => [
      {
        header: 'Company',
        cell: ({ row }) => row.original.company?.name ?? '—',
      },
      {
        header: 'Plant Name',
        cell: ({ row }) => {
          const fence = row.original.geofence
          return (
            <div>
              <p className="font-medium">{row.original.name}</p>
              {fence ? (
                fence.is_active ? (
                  <p className="text-[11px] text-success">Geo fence active</p>
                ) : (
                  <p className="text-[11px] text-destructive">Geo fence inactive</p>
                )
              ) : (
                <p className="text-[11px] text-muted-foreground">No geo fence</p>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'code',
        header: 'Plant Code',
      },
      {
        header: 'Latitude',
        cell: ({ row }) =>
          row.original.latitude != null ? row.original.latitude.toFixed(5) : '—',
      },
      {
        header: 'Longitude',
        cell: ({ row }) =>
          row.original.longitude != null ? row.original.longitude.toFixed(5) : '—',
      },
      {
        accessorKey: 'timezone',
        header: 'Timezone',
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
        header: 'Created Date',
        cell: ({ row }) => formatDate(row.original.created_at),
      },
      {
        header: 'Actions',
        cell: ({ row }) => {
          const plant = row.original
          return (
            <div className="flex flex-wrap gap-1">
              <Button
                size="icon"
                variant="ghost"
                title="View"
                onClick={() => setViewId(plant.id)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                title="Edit"
                onClick={() => {
                  setEditPlant(plant)
                  setFormOpen(true)
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              {plant.is_active ? (
                <Button
                  size="icon"
                  variant="ghost"
                  title="Soft delete"
                  onClick={() => setConfirm({ kind: 'delete', plant })}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  variant="ghost"
                  title="Restore"
                  onClick={() => setConfirm({ kind: 'restore', plant })}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                title={plant.geofence ? "Edit Geo Fence" : "Create Geo Fence"}
                onClick={() =>
                  navigate(`/super-admin/geofence/create?plant_id=${plant.id}`)
                }
              >
                <MapPinned className="h-4 w-4" />
              </Button>
            </div>
          )
        },
      },
    ],
    [navigate],
  )

  const runConfirm = async () => {
    if (confirm.kind === 'geofence-prompt' && confirm.plantId) {
      setConfirm({ kind: null, plant: null })
      navigate(`/super-admin/geofence/create?plant_id=${confirm.plantId}`)
      return
    }
    if (!confirm.plant) return
    if (confirm.kind === 'delete') await softDelete.mutateAsync(confirm.plant.id)
    if (confirm.kind === 'restore') await restore.mutateAsync(confirm.plant.id)
    setConfirm({ kind: null, plant: null })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plants"
        description="Manage power generation plants across companies."
        actions={
          <Button
            onClick={() => {
              setEditPlant(null)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4" /> Create Plant
          </Button>
        }
      />

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input
            placeholder="Search plant, code, company…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
          <Select
            value={companyId}
            onChange={(e) => {
              setCompanyId(e.target.value)
              setPage(1)
            }}
            options={[
              { value: '', label: 'All companies' },
              ...(companies.data?.data ?? []).map((c) => ({
                value: c.id,
                label: c.name,
              })),
            ]}
          />
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as typeof status)
              setPage(1)
            }}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
          <Select
            value={timezone}
            onChange={(e) => {
              setTimezone(e.target.value)
              setPage(1)
            }}
            options={[
              { value: '', label: 'All timezones' },
              ...TIMEZONE_OPTIONS,
            ]}
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        {list.isError ? (
          <div className="p-6 text-center">
            <p className="font-medium text-destructive">Could not load plants</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {(list.error as Error)?.message ||
                'Check that the Super Admin API is running on VITE_API_BASE_URL and SERVICE_ROLE_KEY is set.'}
            </p>
            <Button className="mt-4" variant="outline" onClick={() => void list.refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={list.data?.data ?? []}
            loading={list.isLoading}
            emptyTitle="No plants found"
            emptyDescription="Create a plant and optionally attach a geo fence."
          />
        )}
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">
            {list.data?.count ?? 0} total · Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <PlantFormDialog
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o)
          if (!o) setEditPlant(null)
        }}
        plant={editPlant}
        onCreated={(plantId) =>
          setConfirm({ kind: 'geofence-prompt', plant: null, plantId })
        }
      />

      <ViewPlantDialog
        open={Boolean(viewId)}
        onOpenChange={(o) => !o && setViewId(null)}
        plantId={viewId}
        onCreateGeofence={(id) =>
          navigate(`/super-admin/geofence/create?plant_id=${id}`)
        }
      />

      {confirm.kind === 'delete' && confirm.plant && (
        <ConfirmActionDialog
          open
          onOpenChange={(o) => !o && setConfirm({ kind: null, plant: null })}
          title="Soft delete plant?"
          description={`Deactivate ${confirm.plant.name}? This sets is_active = false. No hard delete.`}
          confirmLabel="Deactivate"
          variant="destructive"
          loading={softDelete.isPending}
          onConfirm={() => void runConfirm()}
        />
      )}

      {confirm.kind === 'restore' && confirm.plant && (
        <ConfirmActionDialog
          open
          onOpenChange={(o) => !o && setConfirm({ kind: null, plant: null })}
          title="Restore plant?"
          description={`Re-activate ${confirm.plant.name}?`}
          confirmLabel="Restore"
          loading={restore.isPending}
          onConfirm={() => void runConfirm()}
        />
      )}

      {confirm.kind === 'geofence-prompt' && (
        <ConfirmActionDialog
          open
          onOpenChange={(o) => !o && setConfirm({ kind: null, plant: null })}
          title="Create Geo Fence now?"
          description="Do you want to create a geo fence for this plant?"
          confirmLabel="Yes, create geo fence"
          cancelLabel="Not now"
          variant="secondary"
          onConfirm={() => void runConfirm()}
        />
      )}
    </div>
  )
}
