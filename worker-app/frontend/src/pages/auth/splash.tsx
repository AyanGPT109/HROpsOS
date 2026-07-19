import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { isSupabaseConfigured } from '@/lib/supabaseClient'

export function SplashPage() {
  const navigate = useNavigate()
  const { session, profile, isInitialized, initialize } = useAuthStore()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    void initialize()
  }, [initialize])

  useEffect(() => {
    if (!isInitialized) return
    const timer = setTimeout(() => setReady(true), 900)
    return () => clearTimeout(timer)
  }, [isInitialized])

  useEffect(() => {
    if (!ready) return
    if (session && profile) {
      if (profile.force_password_change) {
        navigate('/auth/force-change-password', { replace: true })
      } else {
        navigate(authService.homePathForRole(), { replace: true })
      }
    } else {
      navigate('/login', { replace: true })
    }
  }, [ready, session, profile, navigate])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="flex flex-col items-center text-center"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary shadow-elevated">
          <span className="text-2xl font-bold text-primary-foreground">HR</span>
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">HROpsOS</h1>
        <p className="mt-2 text-muted-foreground">Workforce Management System</p>
        <div className="mt-8 h-1 w-24 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.85, ease: 'easeInOut' }}
          />
        </div>
        {!isSupabaseConfigured && (
          <p className="mt-6 max-w-sm text-xs text-warning-foreground">
            Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to connect.
          </p>
        )}
      </motion.div>
    </div>
  )
}
