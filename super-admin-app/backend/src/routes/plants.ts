import { Router } from 'express'
import {
  createGeofenceSchema,
  createPlantSchema,
  updatePlantSchema,
} from '../schemas/plant.js'
import { plantManagementService } from '../services/plantManagement.js'
import type { AuthedRequest } from '../middleware/auth.js'

export const plantRouter = Router()

function mapError(err: unknown) {
  const message = err instanceof Error ? err.message : 'Unexpected error'
  const code = (err as Error & { code?: string }).code

  if (code === 'DUPLICATE_CODE') return { status: 409, error: 'DuplicateCode', message }
  if (code === 'COMPANY_NOT_FOUND') return { status: 404, error: 'CompanyNotFound', message }
  if (code === 'PLANT_NOT_FOUND') return { status: 404, error: 'PlantNotFound', message }
  return { status: 500, error: 'ServerError', message }
}

plantRouter.get('/plants', async (req, res) => {
  try {
    const result = await plantManagementService.listPlants({
      companyId: typeof req.query.companyId === 'string' ? req.query.companyId : undefined,
      status:
        req.query.status === 'active' || req.query.status === 'inactive'
          ? req.query.status
          : 'all',
      timezone: typeof req.query.timezone === 'string' ? req.query.timezone : undefined,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : 10,
    })
    res.json({ data: result })
  } catch (err) {
    const mapped = mapError(err)
    res.status(mapped.status).json({ error: mapped.error, message: mapped.message })
  }
})

plantRouter.get('/plants/:id', async (req, res) => {
  try {
    const result = await plantManagementService.getPlantById(req.params.id!)
    res.json({ data: result })
  } catch (err) {
    const mapped = mapError(err)
    res.status(mapped.status).json({ error: mapped.error, message: mapped.message })
  }
})

plantRouter.post('/plants', async (req, res) => {
  const parsed = createPlantSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({
      error: 'ValidationError',
      message: 'Validation failed',
      details: parsed.error.flatten(),
    })
    return
  }

  try {
    const actorId = (req as AuthedRequest).userId!
    const result = await plantManagementService.createPlant(actorId, parsed.data)
    res.status(201).json({ data: result })
  } catch (err) {
    const mapped = mapError(err)
    res.status(mapped.status).json({ error: mapped.error, message: mapped.message })
  }
})

plantRouter.patch('/plants/:id', async (req, res) => {
  const parsed = updatePlantSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({
      error: 'ValidationError',
      message: 'Validation failed',
      details: parsed.error.flatten(),
    })
    return
  }

  try {
    const actorId = (req as AuthedRequest).userId!
    const result = await plantManagementService.updatePlant(
      actorId,
      req.params.id!,
      parsed.data,
    )
    res.json({ data: result })
  } catch (err) {
    const mapped = mapError(err)
    res.status(mapped.status).json({ error: mapped.error, message: mapped.message })
  }
})

plantRouter.post('/plants/:id/soft-delete', async (req, res) => {
  try {
    const actorId = (req as AuthedRequest).userId!
    const result = await plantManagementService.softDelete(actorId, req.params.id!)
    res.json({ data: result })
  } catch (err) {
    const mapped = mapError(err)
    res.status(mapped.status).json({ error: mapped.error, message: mapped.message })
  }
})

plantRouter.post('/plants/:id/restore', async (req, res) => {
  try {
    const actorId = (req as AuthedRequest).userId!
    const result = await plantManagementService.restore(actorId, req.params.id!)
    res.json({ data: result })
  } catch (err) {
    const mapped = mapError(err)
    res.status(mapped.status).json({ error: mapped.error, message: mapped.message })
  }
})

plantRouter.post('/geofences', async (req, res) => {
  const parsed = createGeofenceSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({
      error: 'ValidationError',
      message: 'Validation failed',
      details: parsed.error.flatten(),
    })
    return
  }

  try {
    const actorId = (req as AuthedRequest).userId!
    const result = await plantManagementService.createGeofence(actorId, parsed.data)
    res.status(201).json({ data: result })
  } catch (err) {
    const mapped = mapError(err)
    res.status(mapped.status).json({ error: mapped.error, message: mapped.message })
  }
})
