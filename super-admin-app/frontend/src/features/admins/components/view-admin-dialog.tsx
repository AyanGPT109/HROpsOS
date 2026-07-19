import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useCompanyAdmin } from '../hooks/useCompanyAdmins'
import { formatDateTime } from '@/utils/date'

interface ViewAdminDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  adminId: string | null
}

export function ViewAdminDialog({ open, onOpenChange, adminId }: ViewAdminDialogProps) {
  const { data: admin, isLoading } = useCompanyAdmin(open ? adminId : null)

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Admin Details"
      description="Personal information and plant assignments."
      className="max-w-lg"
      footer={
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      }
    >
      {isLoading || !admin ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Avatar
              name={admin.profile?.full_name ?? 'Admin'}
              src={admin.profile?.avatar_url}
              size="lg"
            />
            <div>
              <p className="text-lg font-semibold">{admin.profile?.full_name}</p>
              <p className="text-sm text-muted-foreground">{admin.profile?.email}</p>
              <Badge
                className="mt-1"
                variant={admin.is_active ? 'success' : 'outline'}
              >
                {admin.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>

          <section className="space-y-2 rounded-xl border border-border p-4">
            <h4 className="text-sm font-semibold">Personal Information</h4>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Phone</dt>
                <dd>{admin.profile?.phone || '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Role</dt>
                <dd className="capitalize">{admin.profile?.role?.replace('_', ' ')}</dd>
              </div>
            </dl>
          </section>

          <section className="space-y-2 rounded-xl border border-border p-4">
            <h4 className="text-sm font-semibold">Company</h4>
            <p className="text-sm">{admin.company?.name ?? '—'}</p>
            {admin.company?.code && (
              <p className="text-xs text-muted-foreground">{admin.company.code}</p>
            )}
          </section>

          <section className="space-y-2 rounded-xl border border-border p-4">
            <h4 className="text-sm font-semibold">Assigned Plants</h4>
            {(admin.plants ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No plants assigned</p>
            ) : (
              <ul className="space-y-1">
                {admin.plants!.map((p) => (
                  <li
                    key={p.id}
                    className="rounded-lg bg-muted/50 px-3 py-2 text-sm"
                  >
                    {p.name}
                    <span className="ml-2 text-xs text-muted-foreground">{p.code}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{formatDateTime(admin.created_at)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Last login</dt>
              <dd className="text-muted-foreground">Managed by Auth</dd>
            </div>
          </dl>
        </div>
      )}
    </Dialog>
  )
}
