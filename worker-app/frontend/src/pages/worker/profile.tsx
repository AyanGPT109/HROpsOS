import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'

const schema = z.object({
  full_name: z.string().min(2),
  phone: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function WorkerProfilePage() {
  const profile = useAuthStore((s) => s.profile)
  const setProfile = useAuthStore((s) => s.setProfile)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true)
    try {
      const updated = await authService.updateProfile({
        full_name: values.full_name,
        phone: values.phone || null,
      })
      setProfile(updated)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setLoading(false)
    }
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage your personal information." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <Avatar
              name={profile?.full_name ?? 'User'}
              src={profile?.avatar_url}
              size="xl"
            />
            <div>
              <p className="text-lg font-semibold">{profile?.full_name}</p>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>
            <Badge className="capitalize">{profile?.role?.replace('_', ' ')}</Badge>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <Input
                label="Full name"
                error={errors.full_name?.message}
                {...register('full_name')}
              />
              <Input label="Email" value={profile?.email ?? ''} disabled />
              <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
              <Button type="submit" loading={loading}>
                Save changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
