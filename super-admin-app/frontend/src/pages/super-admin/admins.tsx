import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  Eye,
  Pencil,
  Ban,
  CheckCircle2,
  KeyRound,
  Trash2,
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
import { Avatar } from '@/components/ui/avatar'
import { DataTable } from '@/components/shared/data-table'
import { CreateAdminDialog } from '@/features/admins/components/create-admin-dialog'
import { EditAdminDialog } from '@/features/admins/components/edit-admin-dialog'
import { ViewAdminDialog } from '@/features/admins/components/view-admin-dialog'
import { ConfirmDialog } from '@/features/admins/components/confirm-dialog'
import {
  useCompanies,
  useCompanyAdmins,
  useToggleCompanyAdmin,
  useSoftDeleteCompanyAdmin,
  useResetAdminPassword,
} from '@/features/admins/hooks/useCompanyAdmins'
import type { Admin } from '@/types'
import { formatDate } from '@/utils/date'

type ConfirmAction = 'disable' | 'enable' | 'delete' | 'reset' | null

export function SuperAdminAdminsPage() {
  const [search, setSearch] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [createOpen, setCreateOpen] = useState(false)
  const [editAdmin, setEditAdmin] = useState<Admin | null>(null)
  const [viewId, setViewId] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<{
    action: ConfirmAction
    admin: Admin | null
  }>({ action: null, admin: null })

  const companies = useCompanies()
  const list = useCompanyAdmins({
    companyId: companyId || undefined,
    search: search || undefined,
    status,
    page,
    pageSize,
  })

  const toggle = useToggleCompanyAdmin()
  const softDelete = useSoftDeleteCompanyAdmin()
  const resetPassword = useResetAdminPassword()

  const totalPages = Math.max(1, Math.ceil((list.data?.count ?? 0) / pageSize))

  const columns = useMemo<ColumnDef<Admin, unknown>[]>(
    () => [
      {
        header: 'Admin',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar
              name={row.original.profile?.full_name ?? 'Admin'}
              src={row.original.profile?.avatar_url}
              size="sm"
            />
            <div>
              <p className="font-medium">{row.original.profile?.full_name ?? '—'}</p>
              <p className="text-xs text-muted-foreground">
                {row.original.profile?.email ?? '—'}
              </p>
            </div>
          </div>
        ),
      },
      {
        header: 'Phone',
        cell: ({ row }) => row.original.profile?.phone || '—',
      },
      {
        header: 'Company',
        cell: ({ row }) => row.original.company?.name ?? '—',
      },
      {
        header: 'Plants',
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.plants_count ?? 0}</Badge>
        ),
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
        header: 'Created',
        cell: ({ row }) => formatDate(row.original.created_at),
      },
      {
        header: 'Actions',
        cell: ({ row }) => {
          const admin = row.original
          return (
            <div className="flex flex-wrap gap-1">
              <Button
                size="icon"
                variant="ghost"
                title="View"
                onClick={() => setViewId(admin.id)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                title="Edit"
                onClick={() => setEditAdmin(admin)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                title={admin.is_active ? 'Disable' : 'Enable'}
                onClick={() =>
                  setConfirm({
                    action: admin.is_active ? 'disable' : 'enable',
                    admin,
                  })
                }
              >
                {admin.is_active ? (
                  <Ban className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                title="Reset password"
                onClick={() => setConfirm({ action: 'reset', admin })}
              >
                <KeyRound className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                title="Delete"
                onClick={() => setConfirm({ action: 'delete', admin })}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          )
        },
      },
    ],
    [],
  )

  const confirmCopy = {
    disable: {
      title: 'Disable admin?',
      description: `Disable ${confirm.admin?.profile?.full_name ?? 'this admin'}? They will no longer be able to sign in.`,
      label: 'Disable',
      variant: 'destructive' as const,
    },
    enable: {
      title: 'Enable admin?',
      description: `Re-enable ${confirm.admin?.profile?.full_name ?? 'this admin'}?`,
      label: 'Enable',
      variant: 'default' as const,
    },
    delete: {
      title: 'Soft delete admin?',
      description:
        'This deactivates the admin and profile. Auth user is banned — no hard delete.',
      label: 'Deactivate',
      variant: 'destructive' as const,
    },
    reset: {
      title: 'Reset password?',
      description:
        'A temporary password will be generated and force password change will be enabled.',
      label: 'Reset password',
      variant: 'default' as const,
    },
  }

  const runConfirm = async () => {
    if (!confirm.admin || !confirm.action) return
    const id = confirm.admin.id
    if (confirm.action === 'disable') await toggle.mutateAsync({ id, enable: false })
    if (confirm.action === 'enable') await toggle.mutateAsync({ id, enable: true })
    if (confirm.action === 'delete') await softDelete.mutateAsync(id)
    if (confirm.action === 'reset') await resetPassword.mutateAsync(id)
    setConfirm({ action: null, admin: null })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Admins"
        description="Create and manage company administrators across tenants."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Create Admin
          </Button>
        }
      />

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            placeholder="Search name, email, phone…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
          <Select
            placeholder="All companies"
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
        </div>
      </Card>

      <Card className="overflow-hidden">
        <DataTable
          columns={columns}
          data={list.data?.data ?? []}
          loading={list.isLoading}
          emptyTitle="No company admins"
          emptyDescription="Create an admin and assign them to a company and plants."
        />
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

      <CreateAdminDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditAdminDialog
        open={Boolean(editAdmin)}
        onOpenChange={(o) => !o && setEditAdmin(null)}
        admin={editAdmin}
      />
      <ViewAdminDialog
        open={Boolean(viewId)}
        onOpenChange={(o) => !o && setViewId(null)}
        adminId={viewId}
      />

      {confirm.action && (
        <ConfirmDialog
          open
          onOpenChange={(o) => !o && setConfirm({ action: null, admin: null })}
          title={confirmCopy[confirm.action].title}
          description={confirmCopy[confirm.action].description}
          confirmLabel={confirmCopy[confirm.action].label}
          variant={confirmCopy[confirm.action].variant}
          loading={toggle.isPending || softDelete.isPending || resetPassword.isPending}
          onConfirm={() => void runConfirm()}
        />
      )}
    </div>
  )
}
