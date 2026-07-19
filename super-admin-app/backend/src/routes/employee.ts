import { Router } from 'express'
import { getServiceClient } from '../lib/supabase.js'
import type { AuthedRequest } from '../middleware/auth.js'

export const employeeRouter = Router()

employeeRouter.get('/attendance/today', async (req: AuthedRequest, res) => {
  const supabase = getServiceClient()
  const { data: workers, error: workerError } = await supabase
    .from('workers')
    .select('id')
    .eq('user_id', req.userId!)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
  if (workerError) {
    res.status(500).json({ error: 'WorkerLookupFailed', message: workerError.message })
    return
  }
  const worker = workers?.[0]
  if (!worker) {
    res.status(404).json({ error: 'WorkerNotFound', message: 'No active worker record is linked to this account' })
    return
  }
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  
  const parts = formatter.formatToParts(new Date())
  const year = parts.find(p => p.type === 'year')?.value
  const month = parts.find(p => p.type === 'month')?.value
  const day = parts.find(p => p.type === 'day')?.value
  
  const date = `${year}-${month}-${day}`
  const { data: rows, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('worker_id', worker.id)
    .eq('date', date)
    .order('created_at', { ascending: false })
    .limit(1)
  if (error) {
    res.status(500).json({ error: 'AttendanceLookupFailed', message: error.message })
    return
  }
  res.json({ data: rows?.[0] ?? null })
})

employeeRouter.get('/geofence', async (req: AuthedRequest, res) => {
  const supabase = getServiceClient()
  const { data: workers, error: workerError } = await supabase
    .from('workers')
    .select('plant_id')
    .eq('user_id', req.userId!)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)

  if (workerError) {
    res.status(500).json({ error: 'WorkerLookupFailed', message: workerError.message })
    return
  }

  const plantId = workers?.[0]?.plant_id
  if (!plantId) {
    res.status(404).json({ error: 'WorkerNotFound', message: 'No plant assigned.' })
    return
  }

  const { data: fences, error } = await supabase
    .from('geo_fence')
    .select('*')
    .eq('plant_id', plantId)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)

  if (error) {
    res.status(500).json({ error: 'GeofenceLookupFailed', message: error.message })
    return
  }

  res.json({ data: fences?.[0] ?? null })
})
employeeRouter.post('/attendance/upsert', async (req: AuthedRequest, res) => {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('attendance')
    .upsert(req.body.row, { onConflict: req.body.onConflict })
    .select()
    .single()
  if (error) {
    res.status(500).json({ error: 'UpsertFailed', message: error.message })
    return
  }
  res.json({ data })
})

employeeRouter.post('/attendance/update', async (req: AuthedRequest, res) => {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('attendance')
    .update(req.body.row)
    .eq('id', req.body.id)
    .select()
    .single()
  if (error) {
    res.status(500).json({ error: 'UpdateFailed', message: error.message })
    return
  }
  res.json({ data })
})

employeeRouter.post('/attendance/log', async (req: AuthedRequest, res) => {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('attendance_logs')
    .insert(req.body.row)
  if (error) {
    res.status(500).json({ error: 'LogFailed', message: error.message })
    return
  }
  res.json({ data })
})
