import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/types'
import { authService } from '@/services/authService'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isInitialized: boolean
  setSession: (user: User | null, session: Session | null, profile: Profile | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<Profile | null>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      isInitialized: false,

      setSession: (user, session, profile) =>
        set({ user, session, profile }),

      setProfile: (profile) => set({ profile }),

      setLoading: (isLoading) => set({ isLoading }),

      initialize: async () => {
        try {
          set({ isLoading: true })
          const result = await authService.getSession()
          if (result) {
            set({
              user: result.user,
              session: result.session,
              profile: result.profile,
            })
          } else {
            set({ user: null, session: null, profile: null })
          }
        } catch {
          set({ user: null, session: null, profile: null })
        } finally {
          set({ isLoading: false, isInitialized: true })
        }
      },

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const result = await authService.login(email, password)
          set({
            user: result.user,
            session: result.session,
            profile: result.profile,
          })
          return result.profile
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await authService.logout()
        } finally {
          set({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
          })
        }
      },
    }),
    {
      name: 'powertrack-super-admin-auth-store',
      partialize: (state) => ({
        profile: state.profile,
      }),
    },
  ),
)
