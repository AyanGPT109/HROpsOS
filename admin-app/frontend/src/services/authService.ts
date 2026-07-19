import type { Session, User } from '@supabase/supabase-js'
import { requireSupabaseConfig, supabase } from '@/lib/supabaseClient'
import type { Profile } from '@/types'

export interface AuthSession {
  user: User
  session: Session
  profile: Profile | null
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data as Profile | null
}

export const authService = {
  async login(email: string, password: string): Promise<AuthSession> {
    requireSupabaseConfig()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) throw error
    if (!data.session || !data.user) {
      throw new Error('Login failed: no session returned')
    }
    const profile = await fetchProfile(data.user.id)
    return { user: data.user, session: data.session, profile }
  },

  async logout(): Promise<void> {
    requireSupabaseConfig()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession(): Promise<AuthSession | null> {
    if (!import.meta.env.VITE_SUPABASE_URL) return null
    requireSupabaseConfig()
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    if (!data.session?.user) return null
    const profile = await fetchProfile(data.session.user.id)
    return { user: data.session.user, session: data.session, profile }
  },

  async getCurrentProfile(): Promise<Profile | null> {
    requireSupabaseConfig()
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return null
    return fetchProfile(auth.user.id)
  },

  async resetPassword(email: string): Promise<void> {
    requireSupabaseConfig()
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) throw error
  },

  async changePassword(newPassword: string): Promise<void> {
    requireSupabaseConfig()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error

    const { data: auth } = await supabase.auth.getUser()
    if (auth.user) {
      await supabase
        .from('profiles')
        .update({ force_password_change: false, updated_at: new Date().toISOString() })
        .eq('id', auth.user.id)
    }
  },

  async updateProfile(updates: Partial<Profile>): Promise<Profile> {
    requireSupabaseConfig()
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', auth.user.id)
      .select()
      .single()

    if (error) throw error
    return data as Profile
  },

  onAuthStateChange(callback: (session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session)
    })
  },

  /** Admin app always lands on the admin portal. */
  homePathForRole(): string {
    return '/admin'
  },

  expectedRole: 'admin' as const,
}
