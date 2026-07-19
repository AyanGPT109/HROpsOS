import axios, { type AxiosError } from 'axios'
import { supabase } from '@/lib/supabaseClient'

const apiBase =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
  'http://localhost:4000'

export class ApiError extends Error {
  code?: string
  status?: number
  details?: unknown

  constructor(
    message: string,
    code?: string,
    status?: number,
    details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.details = details
  }
}

async function authHeaders() {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) {
    throw new ApiError('You must be signed in', 'Unauthorized', 401)
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

function toApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<{ message?: string; error?: string; details?: unknown }>
    return new ApiError(
      ax.response?.data?.message || ax.message || 'Network request failed',
      ax.response?.data?.error,
      ax.response?.status,
      ax.response?.data?.details,
    )
  }
  if (err instanceof ApiError) return err
  return new ApiError(err instanceof Error ? err.message : 'Unexpected error')
}

export const superAdminApi = {
  async get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
    try {
      const headers = await authHeaders()
      const cleanParams: Record<string, string | number> = {}
      if (params) {
        for (const [key, value] of Object.entries(params)) {
          if (value !== undefined && value !== '') cleanParams[key] = value
        }
      }
      const { data } = await axios.get<{ data: T }>(`${apiBase}${path}`, {
        headers,
        params: cleanParams,
      })
      return data.data
    } catch (err) {
      throw toApiError(err)
    }
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    try {
      const headers = await authHeaders()
      const { data } = await axios.post<{ data: T }>(`${apiBase}${path}`, body ?? {}, { headers })
      return data.data
    } catch (err) {
      throw toApiError(err)
    }
  },

  async patch<T>(path: string, body?: unknown): Promise<T> {
    try {
      const headers = await authHeaders()
      const { data } = await axios.patch<{ data: T }>(`${apiBase}${path}`, body ?? {}, { headers })
      return data.data
    } catch (err) {
      throw toApiError(err)
    }
  },

  async delete<T>(path: string): Promise<T> {
    try {
      const headers = await authHeaders()
      const { data } = await axios.delete<{ data: T }>(`${apiBase}${path}`, { headers })
      return data.data
    } catch (err) {
      throw toApiError(err)
    }
  },
}
