import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { MultiSelect } from '@/components/ui/multi-select'
import {
  createCompanyAdminSchema,
  type CreateCompanyAdminFormValues,
} from '../schemas/adminSchema'
import { useCompanies, useCompanyPlants, useCreateCompanyAdmin } from '../hooks/useCompanyAdmins'

interface CreateAdminDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function generateTempPassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghijkmnopqrstuvwxyz'
  const digits = '23456789'
  const special = '!@#$'
  const all = upper + lower + digits + special
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)]!
  const chars = [pick(upper), pick(lower), pick(digits), pick(special)]
  for (let i = chars.length; i < 12; i++) chars.push(pick(all))
  return chars.sort(() => Math.random() - 0.5).join('')
}

export function CreateAdminDialog({ open, onOpenChange }: CreateAdminDialogProps) {
  const companies = useCompanies()
  const create = useCreateCompanyAdmin()

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateCompanyAdminFormValues>({
    resolver: zodResolver(createCompanyAdminSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      temporary_password: generateTempPassword(),
      company_id: '',
      plant_ids: [],
      force_password_change: true,
      is_active: true,
    },
  })

  const companyId = watch('company_id')
  const plants = useCompanyPlants(companyId || undefined)

  useEffect(() => {
    setValue('plant_ids', [])
  }, [companyId, setValue])

  useEffect(() => {
    if (!open) {
      reset({
        full_name: '',
        email: '',
        phone: '',
        temporary_password: generateTempPassword(),
        company_id: '',
        plant_ids: [],
        force_password_change: true,
        is_active: true,
      })
    }
  }, [open, reset])

  const onSubmit = handleSubmit(async (values) => {
    const result = await create.mutateAsync({
      ...values,
      phone: values.phone || undefined,
    })
    onOpenChange(false)
    // Keep password visible via toast from mutation; also console for copy in dev
    if (import.meta.env.DEV) {
      console.info('Created admin temp password:', result.temporary_password)
    }
  })

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create Company Admin"
      description="Creates an Auth user via the secure backend API. Service role never leaves the server."
      className="max-w-xl"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button loading={create.isPending} onClick={onSubmit}>
            Create Admin
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <Input
          label="Full Name"
          placeholder="Jane Doe"
          error={errors.full_name?.message}
          {...register('full_name')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="admin@company.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Phone Number"
          placeholder="+91 98765 43210"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              label="Temporary Password"
              error={errors.temporary_password?.message}
              {...register('temporary_password')}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setValue('temporary_password', generateTempPassword())}
          >
            Generate
          </Button>
        </div>

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

        <Controller
          control={control}
          name="plant_ids"
          render={({ field }) => (
            <MultiSelect
              label="Assign Plants"
              value={field.value}
              onChange={field.onChange}
              error={errors.plant_ids?.message}
              disabled={!companyId}
              emptyMessage={
                companyId
                  ? plants.isLoading
                    ? 'Loading plants…'
                    : 'No plants for this company'
                  : 'Select a company first'
              }
              options={(plants.data ?? []).map((p) => ({
                value: p.id,
                label: p.name,
                hint: p.code,
              }))}
            />
          )}
        />

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4" {...register('force_password_change')} />
            Force password change on next login
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4" {...register('is_active')} />
            Active status
          </label>
        </div>
      </form>
    </Dialog>
  )
}
