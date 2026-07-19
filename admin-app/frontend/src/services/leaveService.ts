import { requireSupabaseConfig, supabase } from '@/lib/supabaseClient'
import type { AppNotification, LeaveRequest, LeaveType, PaginatedResult } from '@/types'

export const notificationService = {
  async list(params?: {
    page?: number
    pageSize?: number
  }): Promise<PaginatedResult<AppNotification>> {
    requireSupabaseConfig()
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) throw new Error('Not authenticated')

    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 30
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error
    return {
      data: (data ?? []) as AppNotification[],
      count: count ?? 0,
      page,
      pageSize,
    }
  },

  async unreadCount(): Promise<number> {
    requireSupabaseConfig()
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return 0

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', auth.user.id)
      .eq('is_read', false)

    if (error) throw error
    return count ?? 0
  },

  async markAsRead(id: string): Promise<void> {
    requireSupabaseConfig()
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  },

  async markAllAsRead(): Promise<void> {
    requireSupabaseConfig()
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('user_id', auth.user.id)
      .eq('is_read', false)

    if (error) throw error
  },

  subscribe(userId: string, onInsert: (n: AppNotification) => void) {
    requireSupabaseConfig()
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => onInsert(payload.new as AppNotification),
      )
      .subscribe()
  },
}

export const leaveService = {
  async submit(input: {
    leave_type: LeaveType
    start_date: string
    end_date: string
    reason: string
    days_count: number
  }): Promise<LeaveRequest> {
    requireSupabaseConfig()
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) throw new Error('Not authenticated')

    const { data: worker, error: workerError } = await supabase
      .from('workers')
      .select('id, company_id')
      .eq('user_id', auth.user.id)
      .single()
    if (workerError) throw workerError

    const { data, error } = await supabase
      .from('leave_requests')
      .insert({
        worker_id: worker.id,
        company_id: worker.company_id,
        leave_type: input.leave_type,
        start_date: input.start_date,
        end_date: input.end_date,
        reason: input.reason,
        days_count: input.days_count,
        status: 'pending',
        created_by: auth.user.id,
      })
      .select()
      .single()

    if (error) throw error
    return data as LeaveRequest
  },

  async myLeaves(page = 1, pageSize = 25): Promise<PaginatedResult<LeaveRequest>> {
    requireSupabaseConfig()
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) throw new Error('Not authenticated')

    const { data: worker } = await supabase
      .from('workers')
      .select('id')
      .eq('user_id', auth.user.id)
      .single()

    if (!worker) return { data: [], count: 0, page, pageSize }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await supabase
      .from('leave_requests')
      .select('*', { count: 'exact' })
      .eq('worker_id', worker.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error
    return {
      data: (data ?? []) as LeaveRequest[],
      count: count ?? 0,
      page,
      pageSize,
    }
  },

  async cancel(id: string): Promise<void> {
    requireSupabaseConfig()
    const { error } = await supabase
      .from('leave_requests')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'pending')
    if (error) throw error
  },
}
