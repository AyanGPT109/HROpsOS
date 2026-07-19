import { superAdminApi } from '@/lib/apiClient'
import type {
  CreateGeofenceInput,
  CreatePlantInput,
  GeoFence,
  PaginatedResult,
  Plant,
  UpdatePlantInput,
} from '@/types'

export interface ListPlantsParams {
  companyId?: string
  search?: string
  status?: 'all' | 'active' | 'inactive'
  timezone?: string
  page?: number
  pageSize?: number
}

export const plantService = {
  /** List via backend (service role) so Super Admin always sees plants regardless of RLS. */
  async list(params: ListPlantsParams = {}): Promise<PaginatedResult<Plant>> {
    return superAdminApi.get<PaginatedResult<Plant>>('/api/super-admin/plants', {
      companyId: params.companyId,
      search: params.search,
      status: params.status ?? 'all',
      timezone: params.timezone,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
    })
  },

  async getById(plantId: string): Promise<Plant> {
    return superAdminApi.get<Plant>(`/api/super-admin/plants/${plantId}`)
  },

  async create(input: CreatePlantInput) {
    return superAdminApi.post<Plant>('/api/super-admin/plants', input)
  },

  async update(plantId: string, input: UpdatePlantInput) {
    return superAdminApi.patch<Plant>(`/api/super-admin/plants/${plantId}`, input)
  },

  async softDelete(plantId: string) {
    return superAdminApi.post<Plant>(`/api/super-admin/plants/${plantId}/soft-delete`)
  },

  async restore(plantId: string) {
    return superAdminApi.post<Plant>(`/api/super-admin/plants/${plantId}/restore`)
  },

  async createGeofence(input: CreateGeofenceInput) {
    return superAdminApi.post<GeoFence>('/api/super-admin/geofences', input)
  },
}
