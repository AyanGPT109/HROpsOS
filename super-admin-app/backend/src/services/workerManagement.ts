import { getServiceClient } from '../lib/supabase.js'
import type { CreateWorkerInput, UpdateWorkerInput } from '../schemas/worker.js'

export class WorkerManagementService {
  async listWorkers(companyId: string, params: { search?: string; page?: number; pageSize?: number }) {
    const supabase = getServiceClient()
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 50
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    let query = supabase
      .from('workers')
      .select('*, profile:profiles(*), plant:plants(*)', { count: 'exact' })
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .range(from, to)
    if (params.search?.trim()) query = query.ilike('employee_id', `%${params.search.trim()}%`)
    const { data, error, count } = await query
    if (error) throw new Error(error.message)
    return { data: data ?? [], count: count ?? 0, page, pageSize }
  }

  async updateWorker(actorId: string, companyId: string, workerId: string, input: UpdateWorkerInput) {
    const supabase = getServiceClient()
    const { data: existing, error: existingError } = await supabase
      .from('workers')
      .select('id, user_id, company_id')
      .eq('id', workerId)
      .eq('company_id', companyId)
      .maybeSingle()
    if (existingError) throw new Error(existingError.message)
    if (!existing) throw new Error('Worker not found')

    if (input.plant_id) {
      const { data: plant, error: plantError } = await supabase
        .from('plants')
        .select('id')
        .eq('id', input.plant_id)
        .eq('company_id', companyId)
        .maybeSingle()
      if (plantError) throw new Error(plantError.message)
      if (!plant) throw new Error('Selected site does not belong to your company')
    }

    const workerUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const field of ['employee_id', 'plant_id', 'department', 'designation', 'is_active'] as const) {
      if (input[field] !== undefined) workerUpdates[field] = input[field]
    }
    const { data: worker, error: workerError } = await supabase
      .from('workers')
      .update(workerUpdates)
      .eq('id', workerId)
      .select('*, profile:profiles(*), plant:plants(*)')
      .single()
    if (workerError) throw new Error(workerError.message)

    if (input.full_name !== undefined || input.phone !== undefined || input.is_active !== undefined) {
      const profileUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (input.full_name !== undefined) profileUpdates.full_name = input.full_name
      if (input.phone !== undefined) profileUpdates.phone = input.phone
      if (input.is_active !== undefined) profileUpdates.is_active = input.is_active
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', existing.user_id)
      if (profileError) throw new Error(profileError.message)
    }

    return worker
  }

  async createWorker(actorId: string, companyId: string, input: CreateWorkerInput) {
    const supabase = getServiceClient()
    const { data: plant, error: plantError } = await supabase
      .from('plants')
      .select('id')
      .eq('id', input.plant_id)
      .eq('company_id', companyId)
      .maybeSingle()
    if (plantError) throw new Error(plantError.message)
    if (!plant) throw new Error('Selected site does not belong to your company')

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: input.email.toLowerCase(),
      password: input.temporary_password,
      email_confirm: true,
      user_metadata: { full_name: input.full_name, role: 'worker', force_password_change: true },
    })
    if (authError) {
      if (/already|registered|exists/i.test(authError.message)) {
        const err = new Error('An account with this email already exists') as Error & { code: string }
        err.code = 'DUPLICATE_EMAIL'
        throw err
      }
      throw new Error(authError.message)
    }

    const userId = authData.user?.id
    if (!userId) throw new Error('Auth user was not created')
    const rollback = async () => {
      await supabase.from('profiles').delete().eq('id', userId)
      await supabase.auth.admin.deleteUser(userId)
    }

    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: userId,
        email: input.email.toLowerCase(),
        full_name: input.full_name,
        phone: input.phone || null,
        role: 'worker',
        company_id: companyId,
        is_active: true,
        force_password_change: true,
        created_by: actorId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
    if (profileError) {
      await rollback()
      throw new Error(profileError.message)
    }

    const { data: worker, error: workerError } = await supabase
      .from('workers')
      .insert({
        user_id: userId,
        company_id: companyId,
        employee_id: input.employee_id,
        plant_id: input.plant_id,
        department: input.department || null,
        designation: input.designation || null,
        is_active: true,
        created_by: actorId,
      })
      .select('*, profile:profiles(*), plant:plants(*)')
      .single()
    if (workerError) {
      await rollback()
      throw new Error(workerError.message)
    }

    await supabase.from('audit_logs').insert({
      actor_id: actorId,
      action: `Created worker ${input.full_name}`,
      entity_type: 'worker',
      entity_id: worker.id,
      company_id: companyId,
      new_values: { employee_id: input.employee_id, plant_id: input.plant_id },
      created_by: actorId,
    })
    return { worker, temporary_password: input.temporary_password }
  }
}

export const workerManagementService = new WorkerManagementService()
