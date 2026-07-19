import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  companyAdminService,
  type ListCompanyAdminsParams,
} from '../services/companyAdminService'
import type { CreateCompanyAdminInput, UpdateCompanyAdminInput } from '@/types'
import { ApiError } from '@/lib/apiClient'
import { adminService } from '@/services/adminService'
import { plantService } from '@/features/plants/services/plantService'
import { isSupabaseConfigured } from '@/lib/supabaseClient'

export function useCompanies() {
  return useQuery({
    queryKey: ['sa', 'companies'],
    queryFn: () => adminService.listCompanies({ pageSize: 200 }),
    enabled: isSupabaseConfigured,
  })
}

export function useCompanyPlants(companyId?: string) {
  return useQuery({
    queryKey: ['sa', 'plants', companyId],
    // Use the Cloud API instead of the browser Supabase client. The Cloud API
    // uses the service role after authenticating the super admin, so a newly
    // created plant is visible here even when `plants` RLS blocks direct reads.
    queryFn: async () => {
      const result = await plantService.list({
        companyId: companyId!,
        status: 'active',
        pageSize: 200,
      })
      return result.data
    },
    enabled: Boolean(companyId) && isSupabaseConfigured,
  })
}

export function useCompanyAdmins(params: ListCompanyAdminsParams) {
  return useQuery({
    queryKey: ['sa', 'company-admins', params],
    queryFn: () => companyAdminService.list(params),
    enabled: isSupabaseConfigured,
  })
}

export function useCompanyAdmin(adminId?: string | null) {
  return useQuery({
    queryKey: ['sa', 'company-admin', adminId],
    queryFn: () => companyAdminService.getById(adminId!),
    enabled: Boolean(adminId) && isSupabaseConfigured,
  })
}

function errorMessage(err: unknown) {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

export function useCreateCompanyAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCompanyAdminInput) => companyAdminService.create(input),
    onSuccess: (result) => {
      toast.success('Company admin created', {
        description: `Temporary password ready for ${result.email}`,
      })
      void qc.invalidateQueries({ queryKey: ['sa', 'company-admins'] })
    },
    onError: (err) => toast.error(errorMessage(err)),
  })
}

export function useUpdateCompanyAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCompanyAdminInput }) =>
      companyAdminService.update(id, input),
    onSuccess: () => {
      toast.success('Admin updated')
      void qc.invalidateQueries({ queryKey: ['sa', 'company-admins'] })
      void qc.invalidateQueries({ queryKey: ['sa', 'company-admin'] })
    },
    onError: (err) => toast.error(errorMessage(err)),
  })
}

export function useToggleCompanyAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, enable }: { id: string; enable: boolean }) =>
      enable ? companyAdminService.enable(id) : companyAdminService.disable(id),
    onSuccess: (_d, vars) => {
      toast.success(vars.enable ? 'Admin enabled' : 'Admin disabled')
      void qc.invalidateQueries({ queryKey: ['sa', 'company-admins'] })
    },
    onError: (err) => toast.error(errorMessage(err)),
  })
}

export function useSoftDeleteCompanyAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => companyAdminService.softDelete(id),
    onSuccess: () => {
      toast.success('Admin deactivated')
      void qc.invalidateQueries({ queryKey: ['sa', 'company-admins'] })
    },
    onError: (err) => toast.error(errorMessage(err)),
  })
}

export function useResetAdminPassword() {
  return useMutation({
    mutationFn: (id: string) => companyAdminService.resetPassword(id),
    onSuccess: (result) => {
      toast.success('Password reset', {
        description: `Temporary password: ${result.temporary_password}`,
        duration: 12_000,
      })
    },
    onError: (err) => toast.error(errorMessage(err)),
  })
}
