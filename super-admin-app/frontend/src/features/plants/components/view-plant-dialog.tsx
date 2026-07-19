import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { usePlant } from '../hooks/usePlants'
import { formatDateTime } from '@/utils/date'

interface ViewPlantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plantId: string | null
  onCreateGeofence?: (plantId: string) => void
}

export function ViewPlantDialog({
  open,
  onOpenChange,
  plantId,
  onCreateGeofence,
}: ViewPlantDialogProps) {
  const { data: plant, isLoading } = usePlant(open ? plantId : null)

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Plant Details"
      description="Site information, geofence, and assignments."
      className="max-w-lg"
      footer={
        <div className="flex w-full flex-wrap justify-end gap-2">
          {plant && !plant.geofence && onCreateGeofence && (
            <Button
              variant="secondary"
              onClick={() => {
                onOpenChange(false)
                onCreateGeofence(plant.id)
              }}
            >
              Create Geo Fence
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      }
    >
      {isLoading || !plant ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold">{plant.name}</p>
              <p className="text-sm text-muted-foreground">{plant.code}</p>
            </div>
            <Badge variant={plant.is_active ? 'success' : 'outline'}>
              {plant.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Company</dt>
              <dd className="font-medium">{plant.company?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Timezone</dt>
              <dd>{plant.timezone}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Address</dt>
              <dd>{plant.address || '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Latitude</dt>
              <dd>{plant.latitude ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Longitude</dt>
              <dd>{plant.longitude ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{formatDateTime(plant.created_at)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Last updated</dt>
              <dd>{formatDateTime(plant.updated_at)}</dd>
            </div>
          </dl>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground">Geo Fence</p>
              <p className="mt-1 font-semibold">
                {plant.geofence ? (
                  plant.geofence.is_active ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="destructive">Inactive</Badge>
                  )
                ) : (
                  <Badge variant="warning">Not set</Badge>
                )}
              </p>
              {plant.geofence && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {plant.geofence.radius_meters}m radius
                </p>
              )}
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground">Workers</p>
              <p className="mt-1 text-xl font-bold">{plant.workers_count ?? 0}</p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground">Admins</p>
              <p className="mt-1 text-xl font-bold">{plant.admins_count ?? 0}</p>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  )
}
