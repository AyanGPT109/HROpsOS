import axios, { type AxiosError } from 'axios'
import { supabase } from './supabaseClient'

const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || ''

async function authHeaders() {
  const { data } = await supabase.auth.getSession()
  if (!data.session?.access_token) throw new Error('You must be signed in')
  return { Authorization: `Bearer ${data.session.access_token}`, 'Content-Type': 'application/json' }
}

export const tenantApi = {
  async get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
    const url = `${apiBase}${path}`
    try {
      const headers = await authHeaders()
      const token = headers.Authorization.replace('Bearer ', '')
      console.log(`[Admin API Request]`, {
        url,
        method: 'GET',
        tokenExists: !!token,
        tokenLength: token.length,
        tokenMasked: token.length > 20 ? `${token.substring(0, 20)}...` : token,
      })
      const { data } = await axios.get<{ data: T }>(url, {
        headers,
        params,
      })
      return data.data
    } catch (error: any) {
      console.error(`[Admin API Error]`, {
        url,
        method: 'GET',
        code: error.code,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      if (axios.isAxiosError(error)) {
        const response = error as AxiosError<{ message?: string }>
        throw new Error(response.response?.data?.message ?? response.message)
      }
      throw error
    }
  },
  async post<T>(path: string, body: unknown): Promise<T> {
    const url = `${apiBase}${path}`
    try {
      const headers = await authHeaders()
      const token = headers.Authorization.replace('Bearer ', '')
      console.log(`[Admin API Request]`, {
        url,
        method: 'POST',
        tokenExists: !!token,
        tokenLength: token.length,
        tokenMasked: token.length > 20 ? `${token.substring(0, 20)}...` : token,
      })
      const { data } = await axios.post<{ data: T }>(url, body, {
        headers,
      })
      return data.data
    } catch (error: any) {
      console.error(`[Admin API Error]`, {
        url,
        method: 'POST',
        code: error.code,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      if (axios.isAxiosError(error)) {
        const response = error as AxiosError<{ message?: string }>
        throw new Error(response.response?.data?.message ?? response.message)
      }
      throw error
    }
  },
  async patch<T>(path: string, body: unknown): Promise<T> {
    const url = `${apiBase}${path}`
    try {
      const headers = await authHeaders()
      const token = headers.Authorization.replace('Bearer ', '')
      console.log(`[Admin API Request]`, {
        url,
        method: 'PATCH',
        tokenExists: !!token,
        tokenLength: token.length,
        tokenMasked: token.length > 20 ? `${token.substring(0, 20)}...` : token,
      })
      const { data } = await axios.patch<{ data: T }>(url, body, {
        headers,
      })
      return data.data
    } catch (error: any) {
      console.error(`[Admin API Error]`, {
        url,
        method: 'PATCH',
        code: error.code,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      if (axios.isAxiosError(error)) {
        const response = error as AxiosError<{ message?: string }>
        throw new Error(response.response?.data?.message ?? response.message)
      }
      throw error
    }
  },
}
