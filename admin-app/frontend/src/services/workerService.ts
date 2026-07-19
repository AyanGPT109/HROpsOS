import { requireSupabaseConfig, supabase } from '@/lib/supabaseClient'
import { tenantApi } from '@/lib/tenantApi'
import type {
  PaginatedResult,
  Worker,
  WorkerSchedule,
} from '@/types'

export const workerService = {
  async list(params: {
    companyId: string
    plantId?: string
    search?: string
    isActive?: boolean
    page?: number
    pageSize?: number
  }): Promise<PaginatedResult<Worker>> {
    return tenantApi.get<PaginatedResult<Worker>>('/api/tenant/workers', {
      search: params.search,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 25,
    })
  },

  async getById(id: string): Promise<Worker> {
    requireSupabaseConfig()
    const { data, error } = await supabase
      .from('workers')
      .select('*, profile:profiles(*), plant:plants(*)')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Worker
  },

  async getByUserId(userId: string): Promise<Worker | null> {
    requireSupabaseConfig()
    const { data, error } = await supabase
      .from('workers')
      .select('*, profile:profiles(*), plant:plants(*)')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw error
    return data as Worker | null
  },

  async create(input: {
    full_name: string
    email: string
    phone?: string
    temporary_password: string
    employee_id: string
    plant_id: string
    department?: string
    designation?: string
  }): Promise<{ worker: Worker; temporary_password: string }> {
    return tenantApi.post('/api/tenant/workers', input)
  },

  async update(id: string, updates: {
    full_name?: string
    phone?: string | null
    employee_id?: string
    plant_id?: string
    department?: string | null
    designation?: string | null
    is_active?: boolean
  }): Promise<Worker> {
    return tenantApi.patch<Worker>(`/api/tenant/workers/${id}`, updates)
  },

  async deactivate(id: string): Promise<void> {
    await this.update(id, { is_active: false })
  },

  async assignPlant(workerId: string, plantId: string): Promise<void> {
    requireSupabaseConfig()
    const { error } = await supabase
      .from('workers')
      .update({ plant_id: plantId, updated_at: new Date().toISOString() })
      .eq('id', workerId)
    if (error) throw error
  },

  async getSchedule(workerId: string): Promise<WorkerSchedule[]> {
    requireSupabaseConfig()
    const { data, error } = await supabase
      .from('worker_schedule')
      .select('*')
      .eq('worker_id', workerId)
      .order('day_of_week', { ascending: true })
    if (error) throw error
    return (data ?? []) as WorkerSchedule[]
  },

  async assignSchedule(
    workerId: string,
    schedules: Omit<WorkerSchedule, 'id' | 'created_at' | 'updated_at'>[],
  ): Promise<void> {
    requireSupabaseConfig()
    const { error: delError } = await supabase
      .from('worker_schedule')
      .delete()
      .eq('worker_id', workerId)
    if (delError) throw delError

    if (schedules.length === 0) return

    const { error } = await supabase.from('worker_schedule').insert(schedules)
    if (error) throw error
  },
}
