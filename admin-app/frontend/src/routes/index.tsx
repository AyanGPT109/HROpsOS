import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './protected-route'
import { AdminLayout } from '@/layouts/admin-layout'

import { SplashPage } from '@/pages/auth/splash'
import { LoginPage } from '@/pages/auth/login'
import { ForgotPasswordPage } from '@/pages/auth/forgot-password'
import { ForceChangePasswordPage } from '@/pages/auth/force-change-password'

import { AdminDashboardPage } from '@/pages/admin/dashboard'
import { AdminWorkersPage } from '@/pages/admin/workers'
import { AdminAttendancePage } from '@/pages/admin/attendance'
import { AdminLeavesPage } from '@/pages/admin/leaves'
import { AdminGeoLogsPage } from '@/pages/admin/geo-logs'
import { AdminSchedulesPage } from '@/pages/admin/schedules'
import { AdminReportsPage } from '@/pages/admin/reports'
import { AdminNotificationsPage } from '@/pages/admin/notifications'
import { AdminSettingsPage } from '@/pages/admin/settings'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/force-change-password" element={<ForceChangePasswordPage />} />

        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="workers" element={<AdminWorkersPage />} />
            <Route path="attendance" element={<AdminAttendancePage />} />
            <Route path="leaves" element={<AdminLeavesPage />} />
            <Route path="geo-logs" element={<AdminGeoLogsPage />} />
            <Route path="schedules" element={<AdminSchedulesPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
