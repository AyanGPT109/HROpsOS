import type { NextFunction, Request, Response } from 'express'
import { getServiceClient, verifyUserJwt } from '../lib/supabase.js'

export interface AuthedRequest extends Request {
  userId?: string
  userEmail?: string
  companyId?: string | null
}

async function requireRole(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
  allowedRoles: Array<'worker' | 'admin' | 'super_admin'>,
): Promise<void> {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized', message: 'Missing bearer token' })
      return
    }

    const token = header.slice(7)
    const user = await verifyUserJwt(token)
    const supabase = getServiceClient()

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, role, is_active, company_id')
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      res.status(500).json({ error: 'ServerError', message: error.message })
      return
    }

    if (!profile || !allowedRoles.includes(profile.role as 'worker' | 'admin' | 'super_admin') || !profile.is_active) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to perform this action',
      })
      return
    }

    req.userId = user.id
    req.userEmail = user.email
    req.companyId = profile.company_id
    next()
  } catch (err) {
    res.status(401).json({
      error: 'Unauthorized',
      message: err instanceof Error ? err.message : 'Invalid token',
    })
  }
}

export function requireSuperAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  return requireRole(req, res, next, ['super_admin'])
}

export function requireTenantAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  return requireRole(req, res, next, ['admin'])
}

export function requireWorker(req: AuthedRequest, res: Response, next: NextFunction) {
  return requireRole(req, res, next, ['worker'])
}
