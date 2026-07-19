import { Router } from 'express'
import { createWorkerSchema, updateWorkerSchema } from '../schemas/worker.js'
import { workerManagementService } from '../services/workerManagement.js'
import type { AuthedRequest } from '../middleware/auth.js'
import { getServiceClient } from '../lib/supabase.js'

export const tenantWorkerRouter = Router()

tenantWorkerRouter.get('/workers', async (req: AuthedRequest, res) => {
  if (!req.companyId) {
    res.status(403).json({ error: 'Forbidden', message: 'Your admin account is not assigned to a company' })
    return
  }
  try {
    const result = await workerManagementService.listWorkers(req.companyId, {
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : 50,
    })
    res.json({ data: result })
  } catch (err) {
    res.status(500).json({ error: 'WorkerListFailed', message: err instanceof Error ? err.message : 'Unexpected error' })
  }
})

tenantWorkerRouter.get('/plants', async (req: AuthedRequest, res) => {
  if (!req.companyId) {
    res.status(403).json({ error: 'Forbidden', message: 'Your admin account is not assigned to a company' })
    return
  }
  const { data, error } = await getServiceClient()
    .from('plants')
    .select('id, company_id, name, code, is_active, timezone, created_at, updated_at')
    .eq('company_id', req.companyId)
    .eq('is_active', true)
    .order('name')
  if (error) {
    res.status(500).json({ error: 'ServerError', message: error.message })
    return
  }
  res.json({ data: data ?? [] })
})

tenantWorkerRouter.post('/workers', async (req: AuthedRequest, res) => {
  const parsed = createWorkerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'ValidationError', message: 'Validation failed', details: parsed.error.flatten() })
    return
  }
  if (!req.companyId) {
    res.status(403).json({ error: 'Forbidden', message: 'Your admin account is not assigned to a company' })
    return
  }
  try {
    const result = await workerManagementService.createWorker(req.userId!, req.companyId, parsed.data)
    res.status(201).json({ data: result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    const code = (err as Error & { code?: string }).code
    res.status(code === 'DUPLICATE_EMAIL' ? 409 : 400).json({
      error: code === 'DUPLICATE_EMAIL' ? 'DuplicateEmail' : 'WorkerCreateFailed',
      message,
    })
  }
})

tenantWorkerRouter.patch('/workers/:id', async (req: AuthedRequest, res) => {
  const parsed = updateWorkerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'ValidationError', message: 'Validation failed', details: parsed.error.flatten() })
    return
  }
  if (!req.companyId) {
    res.status(403).json({ error: 'Forbidden', message: 'Your admin account is not assigned to a company' })
    return
  }
  try {
    const result = await workerManagementService.updateWorker(req.userId!, req.companyId, String(req.params.id), parsed.data)
    res.json({ data: result })
  } catch (err) {
    res.status(400).json({ error: 'WorkerUpdateFailed', message: err instanceof Error ? err.message : 'Unexpected error' })
  }
})
