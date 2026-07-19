import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './protected-route'
import { WorkerLayout } from '@/layouts/worker-layout'

import { SplashPage } from '@/pages/auth/splash'
import { LoginPage } from '@/pages/auth/login'
import { ForgotPasswordPage } from '@/pages/auth/forgot-password'
import { ForceChangePasswordPage } from '@/pages/auth/force-change-password'

import { WorkerDashboardPage } from '@/pages/worker/dashboard'
import { WorkerSchedulePage } from '@/pages/worker/schedule'
import { WorkerAttendancePage } from '@/pages/worker/attendance'
import { WorkerHistoryPage } from '@/pages/worker/history'
import { WorkerLeavesPage } from '@/pages/worker/leaves'
import { WorkerNotificationsPage } from '@/pages/worker/notifications'
import { WorkerProfilePage } from '@/pages/worker/profile'
import { WorkerSettingsPage } from '@/pages/worker/settings'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/force-change-password" element={<ForceChangePasswordPage />} />

        <Route element={<ProtectedRoute roles={['worker']} />}>
          <Route path="/worker" element={<WorkerLayout />}>
            <Route index element={<WorkerDashboardPage />} />
            <Route path="schedule" element={<WorkerSchedulePage />} />
            <Route path="attendance" element={<WorkerAttendancePage />} />
            <Route path="history" element={<WorkerHistoryPage />} />
            <Route path="leaves" element={<WorkerLeavesPage />} />
            <Route path="notifications" element={<WorkerNotificationsPage />} />
            <Route path="profile" element={<WorkerProfilePage />} />
            <Route path="settings" element={<WorkerSettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
