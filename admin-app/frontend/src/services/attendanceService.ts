import { requireSupabaseConfig, supabase } from '@/lib/supabaseClient'
import type {
  Attendance,
  AttendanceLog,
  CheckInPayload,
  DashboardStats,
  GeoFence,
  PaginatedResult,
} from '@/types'
import {
  computeWorkedMinutes,
  statusFromWorkedMinutes,
} from '@/utils/attendance'
import {
  distanceFromFenceMeters,
  isGpsAccuracyAcceptable,
  isInsideGeofence,
  MIN_GPS_ACCURACY_METERS,
} from '@/utils/geo'

async function getWorkerContext() {
  const { data: auth, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError
  if (!auth.user) throw new Error('Not authenticated')

  const { data: worker, error } = await supabase
    .from('workers')
    .select('*, plant:plants(*)')
    .eq('user_id', auth.user.id)
    .eq('is_active', true)
    .single()

  if (error) throw error
  return worker
}

async function getPlantGeofence(plantId: string): Promise<GeoFence> {
  const { data, error } = await supabase
    .from('geo_fence')
    .select('*')
    .eq('plant_id', plantId)
    .eq('is_active', true)
    .single()

  if (error) throw error
  return data as GeoFence
}

function validateLocation(payload: CheckInPayload, fence: GeoFence) {
  if (!isGpsAccuracyAcceptable(payload.accuracy, MIN_GPS_ACCURACY_METERS)) {
    throw new Error(
      `GPS accuracy is too low (${Math.round(payload.accuracy)}m). Please try again outdoors.`,
    )
  }

  const inside = isInsideGeofence({
    latitude: payload.latitude,
    longitude: payload.longitude,
    fenceLat: fence.latitude,
    fenceLon: fence.longitude,
    radiusMeters: fence.radius_meters,
  })

  if (!inside) {
    throw new Error('You are outside the allowed work area.')
  }

  return distanceFromFenceMeters({
    latitude: payload.latitude,
    longitude: payload.longitude,
    fenceLat: fence.latitude,
    fenceLon: fence.longitude,
  })
}

function todayISODate() {
  return new Date().toISOString().slice(0, 10)
}

export const attendanceService = {
  async getToday(workerId?: string): Promise<Attendance | null> {
    requireSupabaseConfig()
    const worker = workerId
      ? { id: workerId }
      : await getWorkerContext()

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('worker_id', worker.id)
      .eq('date', todayISODate())
      .maybeSingle()

    if (error) throw error
    return data as Attendance | null
  },

  async checkIn(payload: CheckInPayload): Promise<Attendance> {
    requireSupabaseConfig()
    const worker = await getWorkerContext()
    if (!worker.plant_id) throw new Error('No plant assigned. Contact your admin.')

    const fence = await getPlantGeofence(worker.plant_id)
    const distance = validateLocation(payload, fence)

    const existing = await this.getToday(worker.id)
    if (existing?.check_in_at && !existing.check_out_at) {
      throw new Error('You are already checked in.')
    }
    if (existing?.check_out_at) {
      throw new Error('Attendance for today is already completed.')
    }

    const now = new Date().toISOString()
    const row = {
      worker_id: worker.id,
      company_id: worker.company_id,
      plant_id: worker.plant_id,
      date: todayISODate(),
      status: 'checked_in' as const,
      check_in_at: now,
      check_in_lat: payload.latitude,
      check_in_lon: payload.longitude,
      check_in_accuracy: payload.accuracy,
      worked_minutes: 0,
      is_late: false,
      updated_at: now,
      created_by: worker.user_id,
    }

    const { data, error } = await supabase
      .from('attendance')
      .upsert(row, { onConflict: 'worker_id,date' })
      .select()
      .single()

    if (error) throw error

    await supabase.from('attendance_logs').insert({
      worker_id: worker.id,
      company_id: worker.company_id,
      plant_id: worker.plant_id,
      attendance_id: data.id,
      event_type: 'check_in',
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracy: payload.accuracy,
      distance_from_fence: distance,
      inside_fence: true,
      device_info: payload.device_info ?? null,
      created_by: worker.user_id,
    })

    return data as Attendance
  },

  async checkOut(payload: CheckInPayload): Promise<Attendance> {
    requireSupabaseConfig()
    const worker = await getWorkerContext()
    if (!worker.plant_id) throw new Error('No plant assigned. Contact your admin.')

    const fence = await getPlantGeofence(worker.plant_id)
    const distance = validateLocation(payload, fence)

    const existing = await this.getToday(worker.id)
    if (!existing?.check_in_at) {
      throw new Error('You must check in before checking out.')
    }
    if (existing.check_out_at) {
      throw new Error('You have already checked out today.')
    }

    const now = new Date().toISOString()
    const workedMinutes = computeWorkedMinutes(existing.check_in_at, now)
    const status = statusFromWorkedMinutes(workedMinutes)

    const { data, error } = await supabase
      .from('attendance')
      .update({
        status,
        check_out_at: now,
        check_out_lat: payload.latitude,
        check_out_lon: payload.longitude,
        check_out_accuracy: payload.accuracy,
        worked_minutes: workedMinutes,
        updated_at: now,
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error

    await supabase.from('attendance_logs').insert({
      worker_id: worker.id,
      company_id: worker.company_id,
      plant_id: worker.plant_id,
      attendance_id: data.id,
      event_type: 'check_out',
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracy: payload.accuracy,
      distance_from_fence: distance,
      inside_fence: true,
      device_info: payload.device_info ?? null,
      created_by: worker.user_id,
    })

    return data as Attendance
  },

  async getHistory(params: {
    workerId?: string
    from?: string
    to?: string
    page?: number
    pageSize?: number
  }): Promise<PaginatedResult<Attendance>> {
    requireSupabaseConfig()
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 25
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('attendance')
      .select('*, worker:workers(*, profile:profiles(*))', { count: 'exact' })
      .order('date', { ascending: false })
      .range(from, to)

    if (params.workerId) query = query.eq('worker_id', params.workerId)
    if (params.from) query = query.gte('date', params.from)
    if (params.to) query = query.lte('date', params.to)

    const { data, error, count } = await query
    if (error) throw error

    return {
      data: (data ?? []) as Attendance[],
      count: count ?? 0,
      page,
      pageSize,
    }
  },

  async getCompanyToday(companyId: string): Promise<Attendance[]> {
    requireSupabaseConfig()
    const { data, error } = await supabase
      .from('attendance')
      .select('*, worker:workers(*, profile:profiles(*))')
      .eq('company_id', companyId)
      .eq('date', todayISODate())
      .order('check_in_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as Attendance[]
  },

  async getDashboardStats(companyId: string): Promise<DashboardStats> {
    requireSupabaseConfig()
    const today = todayISODate()

    const [{ count: totalWorkers }, { data: attendance }, { count: leaves }] =
      await Promise.all([
        supabase
          .from('workers')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .eq('is_active', true),
        supabase
          .from('attendance')
          .select('status')
          .eq('company_id', companyId)
          .eq('date', today),
        supabase
          .from('leave_requests')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .eq('status', 'approved')
          .lte('start_date', today)
          .gte('end_date', today),
      ])

    const rows = attendance ?? []
    const countStatus = (s: string) => rows.filter((r) => r.status === s).length

    const checkedIn = countStatus('checked_in')
    const present = countStatus('present')
    const halfDay = countStatus('half_day')
    const absent = countStatus('absent')
    const late = rows.filter((r) => (r as { is_late?: boolean }).is_late).length
    const checkedOut = rows.filter((r) =>
      ['present', 'half_day', 'absent', 'checked_out'].includes(r.status),
    ).length

    const total = totalWorkers ?? 0
    const online = checkedIn
    const offline = Math.max(0, total - online)

    return {
      present,
      absent,
      half_day: halfDay,
      leaves: leaves ?? 0,
      checked_in: checkedIn,
      checked_out: checkedOut,
      late,
      workers_online: online,
      workers_offline: offline,
      total_workers: total,
    }
  },

  async getGeoLogs(params: {
    companyId: string
    eventType?: string
    page?: number
    pageSize?: number
  }): Promise<PaginatedResult<AttendanceLog>> {
    requireSupabaseConfig()
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 25
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('attendance_logs')
      .select('*, worker:workers(*, profile:profiles(*))', { count: 'exact' })
      .eq('company_id', params.companyId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (params.eventType) query = query.eq('event_type', params.eventType)

    const { data, error, count } = await query
    if (error) throw error

    return {
      data: (data ?? []) as AttendanceLog[],
      count: count ?? 0,
      page,
      pageSize,
    }
  },

  async logGeoEvent(params: {
    eventType: 'geo_exit' | 'geo_return' | 'heartbeat' | 'geo_enter'
    latitude: number
    longitude: number
    accuracy?: number
    distanceFromFence?: number
    insideFence?: boolean
  }): Promise<void> {
    requireSupabaseConfig()
    const worker = await getWorkerContext()
    if (!worker.plant_id) return

    await supabase.from('attendance_logs').insert({
      worker_id: worker.id,
      company_id: worker.company_id,
      plant_id: worker.plant_id,
      event_type: params.eventType,
      latitude: params.latitude,
      longitude: params.longitude,
      accuracy: params.accuracy ?? null,
      distance_from_fence: params.distanceFromFence ?? null,
      inside_fence: params.insideFence ?? null,
      created_by: worker.user_id,
    })
  },
}
