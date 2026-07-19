import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { workerService } from '@/services/workerService'
import { tenantApi } from '@/lib/tenantApi'
import type { Plant } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

const schema = z.object({
  full_name: z.string().trim().min(2, 'Full name is required'),
  email: z.email('Enter a valid email'),
  phone: z.string().trim().optional(),
  temporary_password: z.string().min(8, 'Password must be at least 8 characters'),
  employee_id: z.string().trim().min(1, 'Employee ID is required'),
  plant_id: z.string().min(1, 'Select a site'),
  department: z.string().trim().optional(),
  designation: z.string().trim().optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

export function CreateWorkerDialog({ open, onOpenChange, onCreated }: Props) {
  const companyId = useAuthStore((state) => state.profile?.company_id)
  const plants = useQuery({
    queryKey: ['admin', 'plants', companyId],
    queryFn: () => tenantApi.get<Plant[]>('/api/tenant/plants'),
    enabled: open && Boolean(companyId),
  })
  const siteError = !companyId
    ? 'Your admin account is not assigned to a company.'
    : plants.error instanceof Error
      ? `Could not load sites: ${plants.error.message}`
      : undefined
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: '', email: '', phone: '', temporary_password: '', employee_id: '', plant_id: '', department: '', designation: '' },
  })

  useEffect(() => {
    if (!open) form.reset()
  }, [open, form])

  const submit = form.handleSubmit(async (values) => {
    try {
      const result = await workerService.create(values)
      toast.success('Worker created', { description: `Temporary password: ${result.temporary_password}`, duration: 12_000 })
      onOpenChange(false)
      onCreated()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create worker')
    }
  })

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add worker"
      description="Creates the worker account, profile, and assigned workforce record."
      footer={<><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button loading={form.formState.isSubmitting} onClick={submit}>Create worker</Button></>}
    >
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <Input label="Full name" error={form.formState.errors.full_name?.message} {...form.register('full_name')} />
        <Input label="Employee ID" error={form.formState.errors.employee_id?.message} {...form.register('employee_id')} />
        <Input className="sm:col-span-2" label="Email" type="email" error={form.formState.errors.email?.message} {...form.register('email')} />
        <Input label="Phone" {...form.register('phone')} />
        <Input label="Temporary password" type="password" error={form.formState.errors.temporary_password?.message} {...form.register('temporary_password')} />
        <Controller control={form.control} name="plant_id" render={({ field }) => <Select label="Site" placeholder={plants.isLoading ? "Loading sites..." : "Select site"} value={field.value} onChange={field.onChange} disabled={plants.isLoading || Boolean(siteError)} error={form.formState.errors.plant_id?.message ?? siteError} options={(plants.data ?? []).map((plant) => ({ value: plant.id, label: plant.name }))} />} />
        <Input label="Department" {...form.register('department')} />
        <Input label="Designation" {...form.register('designation')} />
      </form>
    </Dialog>
  )
}
