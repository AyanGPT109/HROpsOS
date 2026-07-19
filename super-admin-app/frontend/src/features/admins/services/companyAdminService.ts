import { superAdminApi } from '@/lib/apiClient'
import type {
  Admin,
  CreateCompanyAdminInput,
  PaginatedResult,
  UpdateCompanyAdminInput,
} from '@/types'

export interface ListCompanyAdminsParams {
  companyId?: string
  search?: string
  status?: 'all' | 'active' | 'inactive'
  page?: number
  pageSize?: number
}

/** All Cloud administrator reads and writes go through the authenticated API. */
export const companyAdminService = {
  async list(params: ListCompanyAdminsParams = {}): Promise<PaginatedResult<Admin>> {
    return superAdminApi.get<PaginatedResult<Admin>>('/api/super-admin/admins', {
      companyId: params.companyId,
      search: params.search,
      status: params.status ?? 'all',
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
    })
  },

  async getById(adminId: string): Promise<Admin> {
    return superAdminApi.get<Admin>(`/api/super-admin/admins/${adminId}`)
  },

  async create(input: CreateCompanyAdminInput) {
    return superAdminApi.post<{
      admin: Admin
      user_id: string
      email: string
      temporary_password: string
      company_name: string
    }>('/api/super-admin/create-admin', input)
  },

  async update(adminId: string, input: UpdateCompanyAdminInput) {
    return superAdminApi.patch<Admin>(`/api/super-admin/admins/${adminId}`, input)
  },

  async enable(adminId: string) {
    return superAdminApi.post<Admin>(`/api/super-admin/admins/${adminId}/enable`)
  },

  async disable(adminId: string) {
    return superAdminApi.post<Admin>(`/api/super-admin/admins/${adminId}/disable`)
  },

  async softDelete(adminId: string) {
    return superAdminApi.delete<{ id: string; is_active: boolean }>(
      `/api/super-admin/admins/${adminId}`,
    )
  },

  async resetPassword(adminId: string) {
    return superAdminApi.post<{
      admin_id: string
      email?: string
      temporary_password: string
    }>(`/api/super-admin/admins/${adminId}/reset-password`)
  },
}
