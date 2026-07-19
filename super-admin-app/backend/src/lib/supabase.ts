import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'

function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

let adminClient: SupabaseClient | null = null

/** Service-role client — backend only. */
export function getServiceClient(): SupabaseClient {
  if (!adminClient) {
    adminClient = createClient(
      requireEnv('SUPABASE_URL'),
      requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )
  }
  return adminClient
}

/** Verify a user JWT with the anon key (does not use service role for auth checks). */
export async function verifyUserJwt(accessToken: string): Promise<User> {
  const client = createClient(
    requireEnv('SUPABASE_URL'),
    requireEnv('SUPABASE_ANON_KEY'),
    {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    },
  )
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) {
    throw new Error(error?.message ?? 'Invalid or expired token')
  }
  return data.user
}

export function generateTemporaryPassword(length = 12): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghijkmnopqrstuvwxyz'
  const digits = '23456789'
  const special = '!@#$%'
  const all = upper + lower + digits + special
  const pick = (set: string) => set[Math.floor(Math.random() * set.length)]!
  const chars = [pick(upper), pick(lower), pick(digits), pick(special)]
  for (let i = chars.length; i < length; i++) chars.push(pick(all))
  return chars.sort(() => Math.random() - 0.5).join('')
}
