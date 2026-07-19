import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

function assertEnv(value: string | undefined): string {
  if (!value || value.trim() === '') {
    // Allow boot without credentials so UI can still render;
    // service calls will fail with a clear message.
    return ''
  }
  return value
}

export const isSupabaseConfigured =
  Boolean(supabaseUrl?.trim()) && Boolean(supabaseAnonKey?.trim())

export const supabase: SupabaseClient = createClient(
  assertEnv(supabaseUrl) || 'https://placeholder.supabase.co',
  assertEnv(supabaseAnonKey) || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'powertrack-admin-auth',
    },
  },
)

export function requireSupabaseConfig(): void {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.',
    )
  }
}
