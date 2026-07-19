import { getServiceClient } from '../lib/supabase.js'
import type {
  CreateGeofenceInput,
  CreatePlantInput,
  UpdatePlantInput,
} from '../schemas/plant.js'

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

function codedError(message: string, code: string) {
  const err = new Error(message) as Error & { code: string }
  err.code = code
  return err
}

export class PlantManagementService {
  async listPlants(params: {
    companyId?: string
    status?: 'all' | 'active' | 'inactive'
    timezone?: string
    search?: string
    page?: number
    pageSize?: number
  }) {
    const supabase = getServiceClient()
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 10
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('plants')
      .select('*, company:companies(id, name, code)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (params.companyId) query = query.eq('company_id', params.companyId)
    if (params.status === 'active') query = query.eq('is_active', true)
    if (params.status === 'inactive') query = query.eq('is_active', false)
    if (params.timezone) query = query.eq('timezone', params.timezone)

    const { data, error, count } = await query
    if (error) throw new Error(error.message)

    const plants = data ?? []
    const plantIds = plants.map((p) => p.id as string)

    let fencesByPlant = new Map<string, Record<string, unknown>>()
    if (plantIds.length > 0) {
      const { data: fences } = await supabase
        .from('geo_fence')
        .select('id, plant_id, is_active, radius_meters, latitude, longitude, name')
        .in('plant_id', plantIds)

      for (const f of fences ?? []) {
        fencesByPlant.set(f.plant_id as string, f)
      }
    }

    let rows = plants.map((row) => {
      const fence = fencesByPlant.get(row.id as string) ?? null
      return {
        ...row,
        geofence: fence,
        has_geofence: Boolean(fence),
      }
    })

    if (params.search?.trim()) {
      const q = params.search.trim().toLowerCase()
      rows = rows.filter((p) => {
        const companyName =
          (p.company as { name?: string } | null)?.name?.toLowerCase() ?? ''
        return (
          String(p.name).toLowerCase().includes(q) ||
          String(p.code).toLowerCase().includes(q) ||
          companyName.includes(q)
        )
      })
    }

    return {
      data: rows,
      count: params.search?.trim() ? rows.length : (count ?? rows.length),
      page,
      pageSize,
    }
  }

  async getPlantById(plantId: string) {
    const supabase = getServiceClient()

    const { data, error } = await supabase
      .from('plants')
      .select('*, company:companies(id, name, code)')
      .eq('id', plantId)
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!data) throw codedError('Plant not found', 'PLANT_NOT_FOUND')

    const [{ data: fence }, { count: workersCount }, { count: adminsCount }] =
      await Promise.all([
        supabase.from('geo_fence').select('*').eq('plant_id', plantId).maybeSingle(),
        supabase
          .from('workers')
          .select('*', { count: 'exact', head: true })
          .eq('plant_id', plantId)
          .eq('is_active', true),
        supabase
          .from('admin_plants')
          .select('*', { count: 'exact', head: true })
          .eq('plant_id', plantId),
      ])

    return {
      ...data,
      geofence: fence ?? null,
      has_geofence: Boolean(fence),
      workers_count: workersCount ?? 0,
      admins_count: adminsCount ?? 0,
    }
  }

  async createPlant(actorId: string, input: CreatePlantInput) {
    const supabase = getServiceClient()

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', input.company_id)
      .maybeSingle()

    if (companyError) throw new Error(companyError.message)
    if (!company) throw codedError('Company not found', 'COMPANY_NOT_FOUND')

    const { data: dup } = await supabase
      .from('plants')
      .select('id')
      .eq('company_id', input.company_id)
      .eq('code', input.code.trim())
      .maybeSingle()

    if (dup) throw codedError('Plant code already exists for this company', 'DUPLICATE_CODE')

    const { data: plant, error } = await supabase
      .from('plants')
      .insert({
        company_id: input.company_id,
        name: input.name.trim(),
        code: input.code.trim(),
        address: input.address || null,
        latitude: input.latitude,
        longitude: input.longitude,
        timezone: input.timezone,
        is_active: input.is_active,
        created_by: actorId,
      })
      .select('*, company:companies(id, name, code)')
      .single()

    if (error) throw new Error(error.message)

    await writeAuditLog({
      actorId,
      action: `Created Plant ${plant.name}`,
      entityType: 'plant',
      entityId: plant.id,
      companyId: plant.company_id,
      newValues: {
        name: plant.name,
        code: plant.code,
        company_id: plant.company_id,
        latitude: plant.latitude,
        longitude: plant.longitude,
      },
    })

    return plant
  }

  async updatePlant(actorId: string, plantId: string, input: UpdatePlantInput) {
    const supabase = getServiceClient()

    const { data: existing, error } = await supabase
      .from('plants')
      .select('*')
      .eq('id', plantId)
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!existing) throw codedError('Plant not found', 'PLANT_NOT_FOUND')

    const companyId = input.company_id ?? existing.company_id
    const code = input.code?.trim() ?? existing.code

    if (input.company_id) {
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('id', input.company_id)
        .maybeSingle()
      if (!company) throw codedError('Company not found', 'COMPANY_NOT_FOUND')
    }

    const { data: dup } = await supabase
      .from('plants')
      .select('id')
      .eq('company_id', companyId)
      .eq('code', code)
      .neq('id', plantId)
      .maybeSingle()

    if (dup) throw codedError('Plant code already exists for this company', 'DUPLICATE_CODE')

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }
    if (input.company_id !== undefined) updates.company_id = input.company_id
    if (input.name !== undefined) updates.name = input.name.trim()
    if (input.code !== undefined) updates.code = input.code.trim()
    if (input.address !== undefined) updates.address = input.address || null
    if (input.latitude !== undefined) updates.latitude = input.latitude
    if (input.longitude !== undefined) updates.longitude = input.longitude
    if (input.timezone !== undefined) updates.timezone = input.timezone
    if (input.is_active !== undefined) updates.is_active = input.is_active

    const { data: plant, error: updateError } = await supabase
      .from('plants')
      .update(updates)
      .eq('id', plantId)
      .select('*, company:companies(id, name, code)')
      .single()

    if (updateError) throw new Error(updateError.message)

    await writeAuditLog({
      actorId,
      action: `Updated Plant ${plant.name}`,
      entityType: 'plant',
      entityId: plantId,
      companyId: plant.company_id,
      oldValues: existing,
      newValues: input,
    })

    return plant
  }

  async softDelete(actorId: string, plantId: string) {
    return this.updatePlant(actorId, plantId, { is_active: false })
  }

  async restore(actorId: string, plantId: string) {
    return this.updatePlant(actorId, plantId, { is_active: true })
  }

  async createGeofence(actorId: string, input: CreateGeofenceInput) {
    const supabase = getServiceClient()

    const { data: plant, error: plantError } = await supabase
      .from('plants')
      .select('id, company_id, name, latitude, longitude')
      .eq('id', input.plant_id)
      .maybeSingle()

    if (plantError) throw new Error(plantError.message)
    if (!plant) throw codedError('Plant not found', 'PLANT_NOT_FOUND')

    const { data: fence, error } = await supabase
      .from('geo_fence')
      .upsert(
        {
          plant_id: input.plant_id,
          name: input.name || `${plant.name} Fence`,
          latitude: input.latitude,
          longitude: input.longitude,
          radius_meters: input.radius_meters,
          is_active: input.is_active,
          created_by: actorId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'plant_id' },
      )
      .select()
      .single()

    if (error) throw new Error(error.message)

    await writeAuditLog({
      actorId,
      action: `Created / updated Geo Fence for Plant ${plant.name}`,
      entityType: 'geo_fence',
      entityId: fence.id,
      companyId: plant.company_id,
      newValues: input,
    })

    return fence
  }
}

export const plantManagementService = new PlantManagementService()
