export type UserRole = 'worker' | 'admin' | 'super_admin'

export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'half_day'
  | 'late'
  | 'on_leave'
  | 'checked_in'
  | 'checked_out'
  | 'not_checked_in'

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export type LeaveType =
  | 'casual'
  | 'sick'
  | 'earned'
  | 'unpaid'
  | 'compensatory'
  | 'maternity'
  | 'paternity'
  | 'other'

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical'

export type GeoEventType =
  | 'check_in'
  | 'check_out'
  | 'geo_exit'
  | 'geo_return'
  | 'geo_enter'
  | 'heartbeat'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  phone?: string | null
  avatar_url?: string | null
  company_id?: string | null
  force_password_change: boolean
  is_active: boolean
  device_id?: string | null
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  code: string
  logo_url?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  is_active: boolean
  subscription_plan?: string | null
  created_at: string
  updated_at: string
}

export interface Plant {
  id: string
  company_id: string
  name: string
  code: string
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  timezone: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GeoFence {
  id: string
  plant_id: string
  name?: string | null
  latitude: number
  longitude: number
  radius_meters: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Worker {
  id: string
  user_id: string
  company_id: string
  plant_id?: string | null
  employee_id: string
  department?: string | null
  designation?: string | null
  is_active: boolean
  joined_at?: string | null
  created_at: string
  updated_at: string
  profile?: Profile
  plant?: Plant
}

export interface Admin {
  id: string
  user_id: string
  company_id: string
  plant_ids: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  profile?: Profile
}

export interface Attendance {
  id: string
  worker_id: string
  company_id: string
  plant_id: string
  date: string
  status: AttendanceStatus
  check_in_at?: string | null
  check_out_at?: string | null
  check_in_lat?: number | null
  check_in_lon?: number | null
  check_out_lat?: number | null
  check_out_lon?: number | null
  check_in_accuracy?: number | null
  check_out_accuracy?: number | null
  worked_minutes: number
  is_late: boolean
  notes?: string | null
  created_at: string
  updated_at: string
  worker?: Worker
}

export interface AttendanceLog {
  id: string
  worker_id: string
  company_id: string
  plant_id: string
  attendance_id?: string | null
  event_type: GeoEventType
  latitude: number
  longitude: number
  accuracy?: number | null
  distance_from_fence?: number | null
  inside_fence?: boolean | null
  device_info?: Record<string, unknown> | null
  metadata?: Record<string, unknown> | null
  created_at: string
  worker?: Worker
}

export interface WorkerSchedule {
  id: string
  worker_id: string
  plant_id: string
  day_of_week: number
  shift_start: string
  shift_end: string
  break_minutes: number
  is_working_day: boolean
  effective_from?: string | null
  effective_to?: string | null
  created_at: string
  updated_at: string
}

export interface LeaveRequest {
  id: string
  worker_id: string
  company_id: string
  leave_type: LeaveType
  status: LeaveStatus
  start_date: string
  end_date: string
  days_count: number
  reason: string
  reviewed_by?: string | null
  reviewed_at?: string | null
  review_note?: string | null
  created_at: string
  updated_at: string
  worker?: Worker
}

export interface AppNotification {
  id: string
  user_id: string
  title: string
  body: string
  type?: string | null
  data?: Record<string, unknown> | null
  is_read: boolean
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  action: string
  entity_type: string
  entity_id?: string | null
  actor_id?: string | null
  company_id?: string | null
  ip_address?: string | null
  old_values?: Record<string, unknown> | null
  new_values?: Record<string, unknown> | null
  created_at: string
}

export interface SupportTicket {
  id: string
  company_id: string
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  created_by_user_id?: string | null
  assigned_to?: string | null
  resolved_at?: string | null
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  present: number
  absent: number
  half_day: number
  leaves: number
  checked_in: number
  checked_out: number
  late: number
  workers_online: number
  workers_offline: number
  total_workers: number
}

export interface GeoPosition {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

export interface CheckInPayload {
  latitude: number
  longitude: number
  accuracy: number
  device_info?: Record<string, unknown>
}

export interface CreateWorkerInput {
  company_id: string
  employee_id: string
  full_name: string
  email: string
  phone?: string
  plant_id?: string
  department?: string
  designation?: string
}

export interface PaginatedResult<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}
