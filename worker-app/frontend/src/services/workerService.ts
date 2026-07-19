import { requireSupabaseConfig, supabase } from '@/lib/supabaseClient'
import type {
  CreateWorkerInput,
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
    requireSupabaseConfig()
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 25
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('workers')
      .select('*, profile:profiles(*), plant:plants(*)', { count: 'exact' })
      .eq('company_id', params.companyId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (params.plantId) query = query.eq('plant_id', params.plantId)
    if (params.isActive != null) query = query.eq('is_active', params.isActive)
    if (params.search?.trim()) {
      const q = `%${params.search.trim()}%`
      query = query.or(`employee_id.ilike.${q}`)
    }

    const { data, error, count } = await query
    if (error) throw error

    return {
      data: (data ?? []) as Worker[],
      count: count ?? 0,
      page,
      pageSize,
    }
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
      .order('created_at', { ascending: false })
      .limit(1)
    if (error) throw error
    return (data?.[0] ?? null) as Worker | null
  },

  /**
   * Creates a worker profile row. User account creation should be handled
   * by your existing Supabase Edge Function / admin invite flow.
   */
  async create(input: CreateWorkerInput): Promise<Worker> {
    requireSupabaseConfig()
    const { data: auth } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('workers')
      .insert({
        company_id: input.company_id,
        employee_id: input.employee_id,
        plant_id: input.plant_id ?? null,
        department: input.department ?? null,
        designation: input.designation ?? null,
        is_active: true,
        created_by: auth.user?.id ?? null,
        // user_id must be linked after auth user is provisioned
        user_id: auth.user?.id,
      })
      .select('*, profile:profiles(*), plant:plants(*)')
      .single()

    if (error) throw error
    return data as Worker
  },

  async update(id: string, updates: Partial<Worker>): Promise<Worker> {
    requireSupabaseConfig()
    const { data, error } = await supabase
      .from('workers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, profile:profiles(*), plant:plants(*)')
      .single()
    if (error) throw error
    return data as Worker
  },

  async deactivate(id: string): Promise<void> {
    requireSupabaseConfig()
    const { error } = await supabase
      .from('workers')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
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
