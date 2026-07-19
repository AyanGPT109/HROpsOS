import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { tenantApi } from '@/lib/tenantApi'
import { workerService } from '@/services/workerService'
import type { Plant, Worker } from '@/types'

const schema = z.object({
  full_name: z.string().trim().min(2, 'Full name is required'),
  phone: z.string().trim().optional(),
  employee_id: z.string().trim().min(1, 'Employee ID is required'),
  plant_id: z.string().min(1, 'Select a site'),
  department: z.string().trim().optional(),
  designation: z.string().trim().optional(),
})
type FormValues = z.infer<typeof schema>

export function EditWorkerDialog({ worker, onClose, onSaved }: { worker: Worker | null; onClose: () => void; onSaved: () => void }) {
  const plants = useQuery({ queryKey: ['tenant', 'plants'], queryFn: () => tenantApi.get<Plant[]>('/api/tenant/plants'), enabled: Boolean(worker) })
  const form = useForm<FormValues>({ resolver: zodResolver(schema) })
  useEffect(() => {
    if (worker) form.reset({ full_name: worker.profile?.full_name ?? '', phone: worker.profile?.phone ?? '', employee_id: worker.employee_id, plant_id: worker.plant_id ?? '', department: worker.department ?? '', designation: worker.designation ?? '' })
  }, [worker, form])
  if (!worker) return null
  const submit = form.handleSubmit(async (values) => {
    try {
      await workerService.update(worker.id, { ...values, phone: values.phone || null, department: values.department || null, designation: values.designation || null })
      toast.success('Worker updated')
      onClose()
      onSaved()
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not update worker') }
  })
  return <Dialog open onOpenChange={(open) => !open && onClose()} title="Edit worker" description="Update workforce information and site assignment." footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={form.formState.isSubmitting} onClick={submit}>Save changes</Button></>}>
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
      <Input label="Full name" error={form.formState.errors.full_name?.message} {...form.register('full_name')} />
      <Input label="Employee ID" error={form.formState.errors.employee_id?.message} {...form.register('employee_id')} />
      <Input className="sm:col-span-2" label="Email" value={worker.profile?.email ?? ''} disabled />
      <Input label="Phone" {...form.register('phone')} />
      <Controller control={form.control} name="plant_id" render={({ field }) => <Select label="Site" placeholder="Select site" value={field.value} onChange={field.onChange} error={form.formState.errors.plant_id?.message} options={(plants.data ?? []).map((plant) => ({ value: plant.id, label: plant.name }))} />} />
      <Input label="Department" {...form.register('department')} />
      <Input label="Designation" {...form.register('designation')} />
    </form>
  </Dialog>
}
