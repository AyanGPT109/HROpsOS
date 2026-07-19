import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { notificationService } from '@/services/notificationService'
import { useAuthStore } from '@/store/authStore'
import { isSupabaseConfigured } from '@/lib/supabaseClient'

export function useNotifications() {
  const userId = useAuthStore((s) => s.user?.id)
  const queryClient = useQueryClient()

  const listQuery = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => notificationService.list(),
    enabled: Boolean(userId) && isSupabaseConfigured,
  })

  const unreadQuery = useQuery({
    queryKey: ['notifications', 'unread', userId],
    queryFn: () => notificationService.unreadCount(),
    enabled: Boolean(userId) && isSupabaseConfigured,
    refetchInterval: 60_000,
  })

  useEffect(() => {
    if (!userId || !isSupabaseConfigured) return

    const channel = notificationService.subscribe(userId, (n) => {
      toast(n.title, { description: n.body })
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    })

    return () => {
      void channel.unsubscribe()
    }
  }, [userId, queryClient])

  return {
    notifications: listQuery.data?.data ?? [],
    unreadCount: unreadQuery.data ?? 0,
    isLoading: listQuery.isLoading,
    refetch: listQuery.refetch,
    markAsRead: async (id: string) => {
      await notificationService.markAsRead(id)
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    markAllAsRead: async () => {
      await notificationService.markAllAsRead()
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  }
}
