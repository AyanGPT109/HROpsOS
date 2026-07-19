import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  createGeofenceSchema,
  type CreateGeofenceFormValues,
} from '@/features/plants/schemas/plantSchema'
import { useCreateGeofence, usePlant } from '@/features/plants/hooks/usePlants'

export function CreateGeofencePage() {
  const [params] = useSearchParams()
  const plantId = params.get('plant_id')
  const navigate = useNavigate()
  const { data: plant, isLoading } = usePlant(plantId)
  const create = useCreateGeofence()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateGeofenceFormValues>({
    resolver: zodResolver(createGeofenceSchema),
    defaultValues: {
      plant_id: plantId ?? '',
      name: '',
      latitude: 0,
      longitude: 0,
      radius_meters: 200,
      is_active: true,
    },
  })

  useEffect(() => {
    if (!plant) return
    reset({
      plant_id: plant.id,
      name: `${plant.name} Fence`,
      latitude: plant.latitude ?? 0,
      longitude: plant.longitude ?? 0,
      radius_meters: 200,
      is_active: true,
    })
  }, [plant, reset])

  if (!plantId) {
    return (
      <div className="space-y-4">
        <PageHeader title="Create Geo Fence" description="Missing plant_id." />
        <Button variant="outline" onClick={() => navigate('/super-admin/plants')}>
          Back to Plants
        </Button>
      </div>
    )
  }

  const onSubmit = handleSubmit(async (values) => {
    await create.mutateAsync(values)
    navigate('/super-admin/plants')
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Create Geo Fence"
        description="Define the allowed work area for check-in / check-out."
        actions={
          <Button variant="outline" onClick={() => navigate('/super-admin/plants')}>
            Cancel
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isLoading ? 'Loading plant…' : `Plant: ${plant?.name ?? '—'}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <form className="space-y-4" onSubmit={onSubmit}>
              <input type="hidden" {...register('plant_id')} />
              <Input label="Fence name" error={errors.name?.message} {...register('name')} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Latitude"
                  type="number"
                  step="any"
                  error={errors.latitude?.message}
                  {...register('latitude', { valueAsNumber: true })}
                />
                <Input
                  label="Longitude"
                  type="number"
                  step="any"
                  error={errors.longitude?.message}
                  {...register('longitude', { valueAsNumber: true })}
                />
              </div>
              <Input
                label="Radius (meters)"
                type="number"
                error={errors.radius_meters?.message}
                {...register('radius_meters', { valueAsNumber: true })}
              />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="h-4 w-4" {...register('is_active')} />
                Active
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="submit" loading={create.isPending}>
                  Save Geo Fence
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
