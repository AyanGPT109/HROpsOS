import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { MultiSelect } from '@/components/ui/multi-select'
import {
  updateCompanyAdminSchema,
  type UpdateCompanyAdminFormValues,
} from '../schemas/adminSchema'
import {
  useCompanies,
  useCompanyPlants,
  useUpdateCompanyAdmin,
} from '../hooks/useCompanyAdmins'
import type { Admin } from '@/types'

interface EditAdminDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  admin: Admin | null
}

export function EditAdminDialog({ open, onOpenChange, admin }: EditAdminDialogProps) {
  const companies = useCompanies()
  const update = useUpdateCompanyAdmin()

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateCompanyAdminFormValues>({
    resolver: zodResolver(updateCompanyAdminSchema),
  })

  const companyId = watch('company_id')
  const plants = useCompanyPlants(companyId || undefined)

  useEffect(() => {
    if (!admin || !open) return
    reset({
      full_name: admin.profile?.full_name ?? '',
      phone: admin.profile?.phone ?? '',
      company_id: admin.company_id,
      plant_ids:
        admin.plants?.map((p) => p.id) ??
        admin.plant_ids ??
        [],
      is_active: admin.is_active,
    })
  }, [admin, open, reset])

  useEffect(() => {
    if (!admin) return
    // Clear plants only when company actually changes from original
    if (companyId && companyId !== admin.company_id) {
      setValue('plant_ids', [])
    }
  }, [companyId, admin, setValue])

  if (!admin) return null

  const onSubmit = handleSubmit(async (values) => {
    await update.mutateAsync({
      id: admin.id,
      input: {
        full_name: values.full_name,
        phone: values.phone || null,
        company_id: values.company_id,
        plant_ids: values.plant_ids,
        is_active: values.is_active,
      },
    })
    onOpenChange(false)
  })

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Company Admin"
      description="Email cannot be changed."
      className="max-w-xl"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button loading={update.isPending} onClick={onSubmit}>
            Save changes
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <Input label="Email" value={admin.profile?.email ?? ''} disabled />
        <Input
          label="Full Name"
          error={errors.full_name?.message}
          {...register('full_name')}
        />
        <Input label="Phone" error={errors.phone?.message} {...register('phone')} />

        <Controller
          control={control}
          name="company_id"
          render={({ field }) => (
            <Select
              label="Company"
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

        <Controller
          control={control}
          name="plant_ids"
          render={({ field }) => (
            <MultiSelect
              label="Assigned Plants"
              value={field.value}
              onChange={field.onChange}
              error={errors.plant_ids?.message}
              options={(plants.data ?? []).map((p) => ({
                value: p.id,
                label: p.name,
                hint: p.code,
              }))}
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
