import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  TIMEZONE_OPTIONS,
  createPlantSchema,
  type CreatePlantFormValues,
} from '../schemas/plantSchema'
import { useCompaniesForPlants, useCreatePlant, useUpdatePlant } from '../hooks/usePlants'
import type { Plant } from '@/types'

interface PlantFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plant?: Plant | null
  /** Called after successful create with the new plant id */
  onCreated?: (plantId: string) => void
}

export function PlantFormDialog({
  open,
  onOpenChange,
  plant,
  onCreated,
}: PlantFormDialogProps) {
  const isEdit = Boolean(plant)
  const companies = useCompaniesForPlants()
  const create = useCreatePlant()
  const update = useUpdatePlant()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreatePlantFormValues>({
    resolver: zodResolver(createPlantSchema),
    defaultValues: {
      company_id: '',
      name: '',
      code: '',
      address: '',
      latitude: 0,
      longitude: 0,
      timezone: 'Asia/Kolkata',
      is_active: true,
    },
  })

  useEffect(() => {
    if (!open) return
    if (plant) {
      reset({
        company_id: plant.company_id,
        name: plant.name,
        code: plant.code,
        address: plant.address ?? '',
        latitude: plant.latitude ?? 0,
        longitude: plant.longitude ?? 0,
        timezone: plant.timezone || 'Asia/Kolkata',
        is_active: plant.is_active,
      })
    } else {
      reset({
        company_id: '',
        name: '',
        code: '',
        address: '',
        latitude: 0,
        longitude: 0,
        timezone: 'Asia/Kolkata',
        is_active: true,
      })
    }
  }, [open, plant, reset])

  const onSubmit = handleSubmit(async (values) => {
    if (isEdit && plant) {
      await update.mutateAsync({ id: plant.id, input: values })
      onOpenChange(false)
      return
    }
    const created = await create.mutateAsync(values)
    onOpenChange(false)
    onCreated?.(created.id)
  })

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Plant' : 'Create Plant'}
      description="Power generation site linked to a company."
      className="max-w-xl"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            loading={create.isPending || update.isPending}
            onClick={onSubmit}
          >
            {isEdit ? 'Save changes' : 'Create Plant'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <Controller
          control={control}
          name="company_id"
          render={({ field }) => (
            <Select
              label="Company"
              placeholder="Select company"
              value={field.value}
              onChange={field.onChange}
              error={errors.company_id?.message}
              options={(companies.data?.data ?? []).map((c) => ({
                value: c.id,
                label: c.name,
              }))}
            />
          )}
        />
        <Input label="Plant Name" error={errors.name?.message} {...register('name')} />
        <Input label="Plant Code" error={errors.code?.message} {...register('code')} />
        <Input label="Address" error={errors.address?.message} {...register('address')} />
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
        <Controller
          control={control}
          name="timezone"
          render={({ field }) => (
            <Select
              label="Timezone"
              value={field.value}
              onChange={field.onChange}
              error={errors.timezone?.message}
              options={TIMEZONE_OPTIONS}
            />
          )}
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4" {...register('is_active')} />
          Active status
        </label>
      </form>
    </Dialog>
  )
}
