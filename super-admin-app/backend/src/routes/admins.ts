import { Router } from 'express'
import { createAdminSchema, updateAdminSchema } from '../schemas/admin.js'
import { adminManagementService } from '../services/adminManagement.js'
import type { AuthedRequest } from '../middleware/auth.js'

export const adminRouter = Router()

function mapError(err: unknown) {
  const message = err instanceof Error ? err.message : 'Unexpected error'
  const code = (err as Error & { code?: string }).code

  if (code === 'DUPLICATE_EMAIL') return { status: 409, error: 'DuplicateEmail', message }
  if (code === 'COMPANY_NOT_FOUND') return { status: 404, error: 'CompanyNotFound', message }
  if (code === 'PLANT_NOT_FOUND' || code === 'PLANT_COMPANY_MISMATCH') {
    return { status: 400, error: 'PlantNotFound', message }
  }
  if (code === 'ADMIN_NOT_FOUND') return { status: 404, error: 'AdminNotFound', message }
  return { status: 500, error: 'ServerError', message }
}

adminRouter.get('/admins', async (req, res) => {
  try {
    const result = await adminManagementService.listAdmins({
      companyId: typeof req.query.companyId === 'string' ? req.query.companyId : undefined,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      status:
        req.query.status === 'active' || req.query.status === 'inactive'
          ? req.query.status
          : 'all',
      page: req.query.page ? Number(req.query.page) : 1,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : 10,
    })
    res.json({ data: result })
  } catch (err) {
    const mapped = mapError(err)
    res.status(mapped.status).json({ error: mapped.error, message: mapped.message })
  }
})

adminRouter.get('/admins/:id', async (req, res) => {
  try {
    const result = await adminManagementService.getAdminById(req.params.id!)
    res.json({ data: result })
  } catch (err) {
    const mapped = mapError(err)
    res.status(mapped.status).json({ error: mapped.error, message: mapped.message })
  }
})

adminRouter.get('/workers', async (req, res) => {
  const companyId = typeof req.query.companyId === 'string' ? req.query.companyId : undefined
  if (!companyId) {
    res.status(400).json({ error: 'ValidationError', message: 'companyId is required' })
    return
  }
  try {
    const result = await adminManagementService.listWorkers({
      companyId,
      page: req.query.page ? Number(req.query.page) : 1,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : 25,
    })
    res.json({ data: result })
  } catch (err) {
    const mapped = mapError(err)
    res.status(mapped.status).json({ error: mapped.error, message: mapped.message })
  }
})

adminRouter.post('/create-admin', async (req, res) => {
  const parsed = createAdminSchema.safeParse(req.body)
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
    const result = await adminManagementService.createAdmin(actorId, parsed.data)
    res.status(201).json({ data: result })
  } catch (err) {
    const mapped = mapError(err)
    res.status(mapped.status).json({ error: mapped.error, message: mapped.message })
  }
})

adminRouter.patch('/admins/:id', async (req, res) => {
  const parsed = updateAdminSchema.safeParse(req.body)
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
    const result = await adminManagementService.updateAdmin(
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

adminRouter.post('/admins/:id/disable', async (req, res) => {
  try {
    const actorId = (req as AuthedRequest).userId!
    const result = await adminManagementService.setActive(actorId, req.params.id!, false)
    res.json({ data: result })
  } catch (err) {
    const mapped = mapError(err)
    res.status(mapped.status).json({ error: mapped.error, message: mapped.message })
  }
})

adminRouter.post('/admins/:id/enable', async (req, res) => {
  try {
    const actorId = (req as AuthedRequest).userId!
    const result = await adminManagementService.setActive(actorId, req.params.id!, true)
    res.json({ data: result })
  } catch (err) {
    const mapped = mapError(err)
    res.status(mapped.status).json({ error: mapped.error, message: mapped.message })
  }
})

adminRouter.post('/admins/:id/reset-password', async (req, res) => {
  try {
    const actorId = (req as AuthedRequest).userId!
    const result = await adminManagementService.resetPassword(actorId, req.params.id!)
    res.json({ data: result })
  } catch (err) {
    const mapped = mapError(err)
    res.status(mapped.status).json({ error: mapped.error, message: mapped.message })
  }
})

adminRouter.delete('/admins/:id', async (req, res) => {
  try {
    const actorId = (req as AuthedRequest).userId!
    const result = await adminManagementService.softDelete(actorId, req.params.id!)
    res.json({ data: result })
  } catch (err) {
    const mapped = mapError(err)
    res.status(mapped.status).json({ error: mapped.error, message: mapped.message })
  }
})
