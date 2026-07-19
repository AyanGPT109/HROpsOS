import {
  generateTemporaryPassword,
  getServiceClient,
} from '../lib/supabase.js'
import type { CreateAdminInput, UpdateAdminInput } from '../schemas/admin.js'

async function writeAuditLog(params: {
  actorId: string
  action: string
  entityType: string
  entityId: string
  companyId?: string | null
  oldValues?: Record<string, unknown> | null
  newValues?: Record<string, unknown> | null
}) {
  const supabase = getServiceClient()
  await supabase.from('audit_logs').insert({
    actor_id: params.actorId,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId,
    company_id: params.companyId ?? null,
    old_values: params.oldValues ?? null,
    new_values: params.newValues ?? null,
    created_by: params.actorId,
  })
}

export class AdminManagementService {
  async listAdmins(params: {
    companyId?: string
    search?: string
    status?: 'all' | 'active' | 'inactive'
    page?: number
    pageSize?: number
  }) {
    const supabase = getServiceClient()
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 10
    let query = supabase
      .from('admins')
      .select(
        `*, profile:profiles(*), company:companies(id, name, code),
        admin_plants(plant_id, plant:plants(id, name, code))`,
      )
      .order('created_at', { ascending: false })

    if (params.companyId) query = query.eq('company_id', params.companyId)
    if (params.status === 'active') query = query.eq('is_active', true)
    if (params.status === 'inactive') query = query.eq('is_active', false)

    const { data, error } = await query
    if (error) throw new Error(error.message)

    let rows = (data ?? []).map((row) => {
      const plants =
        ((row.admin_plants as { plant?: Record<string, unknown> | null }[] | null) ?? [])
          .map((link) => link.plant)
          .filter(Boolean)
      return {
        ...row,
        plants,
        plants_count: plants.length || ((row.plant_ids as string[] | null)?.length ?? 0),
      }
    })

    if (params.search?.trim()) {
      const search = params.search.trim().toLowerCase()
      rows = rows.filter((row) => {
        const profile = row.profile as { full_name?: string; email?: string; phone?: string } | null
        return [profile?.full_name, profile?.email, profile?.phone].some((value) =>
          value?.toLowerCase().includes(search),
        )
      })
    }

    const count = rows.length
    const start = (page - 1) * pageSize
    return { data: rows.slice(start, start + pageSize), count, page, pageSize }
  }

  async getAdminById(adminId: string) {
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('admins')
      .select(
        `*, profile:profiles(*), company:companies(id, name, code, email, phone),
        admin_plants(plant_id, plant:plants(id, name, code, address))`,
      )
      .eq('id', adminId)
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!data) {
      const err = new Error('Admin not found') as Error & { code: string }
      err.code = 'ADMIN_NOT_FOUND'
      throw err
    }

    const plants =
      ((data.admin_plants as { plant?: Record<string, unknown> | null }[] | null) ?? [])
        .map((link) => link.plant)
        .filter(Boolean)
    return { ...data, plants, plants_count: plants.length }
  }

  async listWorkers(params: { companyId: string; page?: number; pageSize?: number }) {
    const supabase = getServiceClient()
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 25
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    const { data, error, count } = await supabase
      .from('workers')
      .select('*, profile:profiles(*), plant:plants(*)', { count: 'exact' })
      .eq('company_id', params.companyId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw new Error(error.message)
    return { data: data ?? [], count: count ?? 0, page, pageSize }
  }

  async createAdmin(actorId: string, input: CreateAdminInput) {
    const supabase = getServiceClient()

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name, is_active')
      .eq('id', input.company_id)
      .maybeSingle()

    if (companyError) throw new Error(companyError.message)
    if (!company) {
      const err = new Error('Company not found')
      ;(err as Error & { code: string }).code = 'COMPANY_NOT_FOUND'
      throw err
    }

    const { data: plants, error: plantsError } = await supabase
      .from('plants')
      .select('id, company_id')
      .in('id', input.plant_ids)

    if (plantsError) throw new Error(plantsError.message)
    if (!plants || plants.length !== input.plant_ids.length) {
      const err = new Error('One or more plants were not found')
      ;(err as Error & { code: string }).code = 'PLANT_NOT_FOUND'
      throw err
    }
    if (plants.some((p) => p.company_id !== input.company_id)) {
      const err = new Error('All plants must belong to the selected company')
      ;(err as Error & { code: string }).code = 'PLANT_COMPANY_MISMATCH'
      throw err
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: input.email.toLowerCase(),
      password: input.temporary_password,
      email_confirm: true,
      user_metadata: {
        full_name: input.full_name,
        role: 'admin',
        force_password_change: input.force_password_change,
      },
    })

    if (authError) {
      const message = authError.message.toLowerCase()
      if (message.includes('already') || message.includes('registered') || message.includes('exists')) {
        const err = new Error('An account with this email already exists')
        ;(err as Error & { code: string }).code = 'DUPLICATE_EMAIL'
        throw err
      }
      throw new Error(authError.message)
    }

    const userId = authData.user?.id
    if (!userId) throw new Error('Auth user was not created')

    // Upsert profile (trigger may have already inserted a row)
    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: userId,
        email: input.email.toLowerCase(),
        full_name: input.full_name,
        phone: input.phone || null,
        role: 'admin',
        company_id: input.company_id,
        is_active: input.is_active,
        force_password_change: input.force_password_change,
        created_by: actorId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )

    if (profileError) {
      await supabase.auth.admin.deleteUser(userId)
      throw new Error(profileError.message)
    }

    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .insert({
        user_id: userId,
        company_id: input.company_id,
        is_active: input.is_active,
        plant_ids: input.plant_ids,
        created_by: actorId,
      })
      .select()
      .single()

    if (adminError) {
      await supabase.auth.admin.deleteUser(userId)
      throw new Error(adminError.message)
    }

    const plantRows = input.plant_ids.map((plant_id) => ({
      admin_id: admin.id,
      plant_id,
    }))

    const { error: plantLinkError } = await supabase.from('admin_plants').insert(plantRows)
    if (plantLinkError) {
      // Non-fatal if table missing plant_ids column on admins still has data
      // but for this module admin_plants is required
      await supabase.from('admins').delete().eq('id', admin.id)
      await supabase.from('profiles').delete().eq('id', userId)
      await supabase.auth.admin.deleteUser(userId)
      throw new Error(plantLinkError.message)
    }

    await writeAuditLog({
      actorId,
      action: `Created Company Admin ${input.full_name}`,
      entityType: 'admin',
      entityId: admin.id,
      companyId: input.company_id,
      newValues: {
        email: input.email,
        full_name: input.full_name,
        company_id: input.company_id,
        plant_ids: input.plant_ids,
        is_active: input.is_active,
      },
    })

    return {
      admin,
      user_id: userId,
      email: input.email.toLowerCase(),
      temporary_password: input.temporary_password,
      company_name: company.name,
    }
  }

  async updateAdmin(actorId: string, adminId: string, input: UpdateAdminInput) {
    const supabase = getServiceClient()

    const { data: existing, error } = await supabase
      .from('admins')
      .select('*, profile:profiles(*)')
      .eq('id', adminId)
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!existing) {
      const err = new Error('Admin not found')
      ;(err as Error & { code: string }).code = 'ADMIN_NOT_FOUND'
      throw err
    }

    const companyId = input.company_id ?? existing.company_id

    if (input.company_id) {
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('id', input.company_id)
        .maybeSingle()
      if (!company) {
        const err = new Error('Company not found')
        ;(err as Error & { code: string }).code = 'COMPANY_NOT_FOUND'
        throw err
      }
    }

    if (input.plant_ids) {
      const { data: plants } = await supabase
        .from('plants')
        .select('id, company_id')
        .in('id', input.plant_ids)
      if (!plants || plants.length !== input.plant_ids.length) {
        const err = new Error('One or more plants were not found')
        ;(err as Error & { code: string }).code = 'PLANT_NOT_FOUND'
        throw err
      }
      if (plants.some((p) => p.company_id !== companyId)) {
        const err = new Error('All plants must belong to the selected company')
        ;(err as Error & { code: string }).code = 'PLANT_COMPANY_MISMATCH'
        throw err
      }
    }

    const profileUpdates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }
    if (input.full_name !== undefined) profileUpdates.full_name = input.full_name
    if (input.phone !== undefined) profileUpdates.phone = input.phone
    if (input.company_id !== undefined) profileUpdates.company_id = input.company_id
    if (input.is_active !== undefined) profileUpdates.is_active = input.is_active

    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', existing.user_id)
    if (profileError) throw new Error(profileError.message)

    const adminUpdates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }
    if (input.company_id !== undefined) adminUpdates.company_id = input.company_id
    if (input.is_active !== undefined) adminUpdates.is_active = input.is_active
    if (input.plant_ids !== undefined) adminUpdates.plant_ids = input.plant_ids

    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .update(adminUpdates)
      .eq('id', adminId)
      .select('*, profile:profiles(*)')
      .single()
    if (adminError) throw new Error(adminError.message)

    if (input.plant_ids) {
      await supabase.from('admin_plants').delete().eq('admin_id', adminId)
      const { error: plantLinkError } = await supabase.from('admin_plants').insert(
        input.plant_ids.map((plant_id) => ({
          admin_id: adminId,
          plant_id,
        })),
      )
      if (plantLinkError) throw new Error(plantLinkError.message)
    }

    await writeAuditLog({
      actorId,
      action: `Updated Company Admin ${admin.profile?.full_name ?? adminId}`,
      entityType: 'admin',
      entityId: adminId,
      companyId,
      oldValues: {
        full_name: existing.profile?.full_name,
        company_id: existing.company_id,
        is_active: existing.is_active,
        plant_ids: existing.plant_ids,
      },
      newValues: input,
    })

    return admin
  }

  async setActive(actorId: string, adminId: string, isActive: boolean) {
    const result = await this.updateAdmin(actorId, adminId, { is_active: isActive })
    const supabase = getServiceClient()
    const { data: existing } = await supabase
      .from('admins')
      .select('user_id')
      .eq('id', adminId)
      .maybeSingle()

    if (existing?.user_id) {
      await supabase.auth.admin.updateUserById(existing.user_id, {
        ban_duration: isActive ? 'none' : '876000h',
      })
    }

    return result
  }

  async softDelete(actorId: string, adminId: string) {
    const supabase = getServiceClient()
    const { data: existing, error } = await supabase
      .from('admins')
      .select('*, profile:profiles(*)')
      .eq('id', adminId)
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!existing) {
      const err = new Error('Admin not found')
      ;(err as Error & { code: string }).code = 'ADMIN_NOT_FOUND'
      throw err
    }

    await supabase
      .from('profiles')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', existing.user_id)

    await supabase
      .from('admins')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', adminId)

    // Ban auth login without hard-deleting the user
    await supabase.auth.admin.updateUserById(existing.user_id, {
      ban_duration: '876000h',
    })

    await writeAuditLog({
      actorId,
      action: `Soft-deleted Company Admin ${existing.profile?.full_name ?? adminId}`,
      entityType: 'admin',
      entityId: adminId,
      companyId: existing.company_id,
      oldValues: { is_active: true },
      newValues: { is_active: false },
    })

    return { id: adminId, is_active: false }
  }

  async resetPassword(actorId: string, adminId: string) {
    const supabase = getServiceClient()
    const { data: existing, error } = await supabase
      .from('admins')
      .select('*, profile:profiles(*)')
      .eq('id', adminId)
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!existing) {
      const err = new Error('Admin not found')
      ;(err as Error & { code: string }).code = 'ADMIN_NOT_FOUND'
      throw err
    }

    const temporaryPassword = generateTemporaryPassword()

    const { error: authError } = await supabase.auth.admin.updateUserById(existing.user_id, {
      password: temporaryPassword,
    })
    if (authError) throw new Error(authError.message)

    await supabase
      .from('profiles')
      .update({
        force_password_change: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.user_id)

    await writeAuditLog({
      actorId,
      action: `Reset password for Company Admin ${existing.profile?.full_name ?? adminId}`,
      entityType: 'admin',
      entityId: adminId,
      companyId: existing.company_id,
      newValues: { force_password_change: true },
    })

    return {
      admin_id: adminId,
      email: existing.profile?.email,
      temporary_password: temporaryPassword,
    }
  }
}

export const adminManagementService = new AdminManagementService()
