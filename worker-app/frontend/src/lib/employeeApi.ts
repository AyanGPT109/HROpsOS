import axios, { type AxiosError } from 'axios'
import { supabase } from './supabaseClient'

export const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:4000'

export async function employeeGet<T>(path: string): Promise<T> {
  const { data: session } = await supabase.auth.getSession()
  if (!session.session?.access_token) throw new Error('You must be signed in')
  try {
    console.log("API URL:", `${apiBase}${path}`);
    const { data } = await axios.get<{ data: T }>(`${apiBase}${path}`, {
      headers: { Authorization: `Bearer ${session.session.access_token}` },
    })
    return data.data
  } catch (error: any) {
    console.error("AXIOS GET ERROR:", {
      code: error.code,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      request: !!error.request,
      onLine: navigator.onLine,
    });
    if (axios.isAxiosError(error)) {
      const response = error as AxiosError<{ message?: string }>
      throw new Error(response.response?.data?.message ?? response.message)
    }
    throw error
  }
}
export async function employeePost<T>(path: string, body?: any): Promise<T> {
  const { data: session } = await supabase.auth.getSession()
  if (!session.session?.access_token) throw new Error('You must be signed in')
  try {
    console.log("API URL:", `${apiBase}${path}`);
    const { data } = await axios.post<{ data: T }>(`${apiBase}${path}`, body, {
      headers: { Authorization: `Bearer ${session.session.access_token}` },
    })
    return data.data
  } catch (error: any) {
    console.error("AXIOS POST ERROR:", {
      code: error.code,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      request: !!error.request,
      onLine: navigator.onLine,
    });
    if (axios.isAxiosError(error)) {
      const response = error as AxiosError<{ message?: string }>
      throw new Error(response.response?.data?.message ?? response.message)
    }
    throw error
  }
}
