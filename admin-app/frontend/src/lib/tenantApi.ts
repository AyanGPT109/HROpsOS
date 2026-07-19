import axios, { type AxiosError } from 'axios'
import { supabase } from './supabaseClient'

const apiBase =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
  'http://localhost:4000'

async function authHeaders() {
  const { data } = await supabase.auth.getSession()
  if (!data.session?.access_token) throw new Error('You must be signed in')
  return { Authorization: `Bearer ${data.session.access_token}`, 'Content-Type': 'application/json' }
}

export const tenantApi = {
  async get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
    try {
      const { data } = await axios.get<{ data: T }>(`${apiBase}${path}`, {
        headers: await authHeaders(),
        params,
      })
      return data.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const response = error as AxiosError<{ message?: string }>
        throw new Error(response.response?.data?.message ?? response.message)
      }
      throw error
    }
  },
  async post<T>(path: string, body: unknown): Promise<T> {
    try {
      const { data } = await axios.post<{ data: T }>(`${apiBase}${path}`, body, {
        headers: await authHeaders(),
      })
      return data.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const response = error as AxiosError<{ message?: string }>
        throw new Error(response.response?.data?.message ?? response.message)
      }
      throw error
    }
  },
  async patch<T>(path: string, body: unknown): Promise<T> {
    try {
      const { data } = await axios.patch<{ data: T }>(`${apiBase}${path}`, body, {
        headers: await authHeaders(),
      })
      return data.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const response = error as AxiosError<{ message?: string }>
        throw new Error(response.response?.data?.message ?? response.message)
      }
      throw error
    }
  },
}
