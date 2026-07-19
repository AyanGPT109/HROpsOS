import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { attendanceService } from '@/services/attendanceService'
import type { CheckInPayload } from '@/types'
import { useGeolocation } from './useGeolocation'

export function useTodayAttendance(workerId?: string) {
  return useQuery({
    queryKey: ['attendance', 'today', workerId],
    queryFn: () => attendanceService.getToday(workerId),
  })
}

export function useAttendanceHistory(params: {
  workerId?: string
  from?: string
  to?: string
  page?: number
  pageSize?: number
}) {
  return useQuery({
    queryKey: ['attendance', 'history', params],
    queryFn: () => attendanceService.getHistory(params),
  })
}

export function useDashboardStats(companyId?: string | null) {
  return useQuery({
    queryKey: ['dashboard', 'stats', companyId],
    queryFn: () => attendanceService.getDashboardStats(companyId!),
    enabled: Boolean(companyId),
  })
}

export function useCheckInOut() {
  const queryClient = useQueryClient()
  const { getCurrentPosition, loading: locating } = useGeolocation()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['attendance'] })
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const checkIn = useMutation({
    mutationFn: async () => {
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please try again when online.')
      }
      const pos = await getCurrentPosition()
      const payload: CheckInPayload = {
        latitude: pos.latitude,
        longitude: pos.longitude,
        accuracy: pos.accuracy,
        device_info: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        },
      }
      return attendanceService.checkIn(payload)
    },
    onSuccess: () => {
      toast.success('Checked in successfully')
      invalidate()
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Check-in failed')
    },
  })

  const checkOut = useMutation({
    mutationFn: async () => {
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please try again when online.')
      }
      const pos = await getCurrentPosition()
      const payload: CheckInPayload = {
        latitude: pos.latitude,
        longitude: pos.longitude,
        accuracy: pos.accuracy,
        device_info: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        },
      }
      return attendanceService.checkOut(payload)
    },
    onSuccess: (data) => {
      toast.success(`Checked out · ${Math.floor(data.worked_minutes / 60)}h ${data.worked_minutes % 60}m`)
      invalidate()
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Check-out failed')
    },
  })

  return {
    checkIn,
    checkOut,
    locating,
    isBusy: locating || checkIn.isPending || checkOut.isPending,
  }
}
