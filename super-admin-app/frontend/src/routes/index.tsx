import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './protected-route'
import { SuperAdminLayout } from '@/layouts/super-admin-layout'

import { SplashPage } from '@/pages/auth/splash'
import { LoginPage } from '@/pages/auth/login'
import { ForgotPasswordPage } from '@/pages/auth/forgot-password'
import { ForceChangePasswordPage } from '@/pages/auth/force-change-password'

import { SuperAdminDashboardPage } from '@/pages/super-admin/dashboard'
import { SuperAdminCompaniesPage } from '@/pages/super-admin/companies'
import { SuperAdminPlantsPage } from '@/pages/super-admin/plants'
import { CreateGeofencePage } from '@/pages/super-admin/geofence-create'
import { SuperAdminAdminsPage } from '@/pages/super-admin/admins'
import { SuperAdminWorkersPage } from '@/pages/super-admin/workers'
import { SuperAdminAnalyticsPage } from '@/pages/super-admin/analytics'
import { SuperAdminAuditPage } from '@/pages/super-admin/audit'
import { SuperAdminSupportPage } from '@/pages/super-admin/support'
import { SuperAdminSettingsPage } from '@/pages/super-admin/settings'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/force-change-password" element={<ForceChangePasswordPage />} />

        <Route element={<ProtectedRoute roles={['super_admin']} />}>
          <Route path="/super-admin" element={<SuperAdminLayout />}>
            <Route index element={<SuperAdminDashboardPage />} />
            <Route path="companies" element={<SuperAdminCompaniesPage />} />
            <Route path="plants" element={<SuperAdminPlantsPage />} />
            <Route path="geofence/create" element={<CreateGeofencePage />} />
            <Route path="admins" element={<SuperAdminAdminsPage />} />
            <Route path="workers" element={<SuperAdminWorkersPage />} />
            <Route path="analytics" element={<SuperAdminAnalyticsPage />} />
            <Route path="audit" element={<SuperAdminAuditPage />} />
            <Route path="support" element={<SuperAdminSupportPage />} />
            <Route path="settings" element={<SuperAdminSettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
