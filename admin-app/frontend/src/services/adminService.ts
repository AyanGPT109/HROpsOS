import { requireSupabaseConfig, supabase } from '@/lib/supabaseClient'
import type {
  Admin,
  AuditLog,
  Company,
  LeaveRequest,
  LeaveStatus,
  PaginatedResult,
  Plant,
  SupportTicket,
} from '@/types'

export const adminService = {
  async listCompanies(params?: {
    search?: string
    page?: number
    pageSize?: number
  }): Promise<PaginatedResult<Company>> {
    requireSupabaseConfig()
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 25
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('companies')
      .select('*', { count: 'exact' })
      .order('name')
      .range(from, to)

    if (params?.search?.trim()) {
      query = query.ilike('name', `%${params.search.trim()}%`)
    }

    const { data, error, count } = await query
    if (error) throw error
    return { data: (data ?? []) as Company[], count: count ?? 0, page, pageSize }
  },

  async createCompany(input: Partial<Company>): Promise<Company> {
    requireSupabaseConfig()
    const { data, error } = await supabase
      .from('companies')
      .insert(input)
      .select()
      .single()
    if (error) throw error
    return data as Company
  },

  async updateCompany(id: string, updates: Partial<Company>): Promise<Company> {
    requireSupabaseConfig()
    const { data, error } = await supabase
      .from('companies')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Company
  },

  async listPlants(companyId: string): Promise<Plant[]> {
    requireSupabaseConfig()
    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .eq('company_id', companyId)
      .order('name')
    if (error) throw error
    return (data ?? []) as Plant[]
  },

  async createPlant(input: Partial<Plant>): Promise<Plant> {
    requireSupabaseConfig()
    const { data, error } = await supabase.from('plants').insert(input).select().single()
    if (error) throw error
    return data as Plant
  },

  async updatePlant(id: string, updates: Partial<Plant>): Promise<Plant> {
    requireSupabaseConfig()
    const { data, error } = await supabase
      .from('plants')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Plant
  },

  async listAdmins(companyId: string): Promise<Admin[]> {
    requireSupabaseConfig()
    const { data, error } = await supabase
      .from('admins')
      .select('*, profile:profiles(*)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as Admin[]
  },

  async listLeaves(params: {
    companyId: string
    status?: LeaveStatus
    page?: number
    pageSize?: number
  }): Promise<PaginatedResult<LeaveRequest>> {
    requireSupabaseConfig()
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 25
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('leave_requests')
      .select('*, worker:workers(*, profile:profiles(*))', { count: 'exact' })
      .eq('company_id', params.companyId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (params.status) query = query.eq('status', params.status)

    const { data, error, count } = await query
    if (error) throw error
    return {
      data: (data ?? []) as LeaveRequest[],
      count: count ?? 0,
      page,
      pageSize,
    }
  },

  async reviewLeave(
    leaveId: string,
    status: 'approved' | 'rejected',
    note?: string,
  ): Promise<LeaveRequest> {
    requireSupabaseConfig()
    const { data: auth } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status,
        review_note: note ?? null,
        reviewed_by: auth.user?.id ?? null,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', leaveId)
      .select('*, worker:workers(*, profile:profiles(*))')
      .single()
    if (error) throw error
    return data as LeaveRequest
  },

  async listAuditLogs(params: {
    companyId?: string
    page?: number
    pageSize?: number
  }): Promise<PaginatedResult<AuditLog>> {
    requireSupabaseConfig()
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 25
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (params.companyId) query = query.eq('company_id', params.companyId)

    const { data, error, count } = await query
    if (error) throw error
    return {
      data: (data ?? []) as AuditLog[],
      count: count ?? 0,
      page,
      pageSize,
    }
  },

  async listTickets(params?: {
    companyId?: string
    page?: number
    pageSize?: number
  }): Promise<PaginatedResult<SupportTicket>> {
    requireSupabaseConfig()
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 25
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('support_tickets')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (params?.companyId) query = query.eq('company_id', params.companyId)

    const { data, error, count } = await query
    if (error) throw error
    return {
      data: (data ?? []) as SupportTicket[],
      count: count ?? 0,
      page,
      pageSize,
    }
  },
}
