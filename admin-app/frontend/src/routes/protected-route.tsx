import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'

interface ProtectedRouteProps {
  roles?: UserRole[]
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { session, profile, isInitialized, isLoading } = useAuthStore()
  const location = useLocation()

  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-8">
        <div className="w-full max-w-md space-y-3">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (profile?.force_password_change && !location.pathname.includes('force-change-password')) {
    return <Navigate to="/auth/force-change-password" replace />
  }

  if (roles && profile && !roles.includes(profile.role)) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ error: 'You do not have access to this application.' }}
      />
    )
  }

  return <Outlet />
}
