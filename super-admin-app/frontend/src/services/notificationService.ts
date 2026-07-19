import { requireSupabaseConfig, supabase } from '@/lib/supabaseClient'
import type { AppNotification, PaginatedResult } from '@/types'

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
