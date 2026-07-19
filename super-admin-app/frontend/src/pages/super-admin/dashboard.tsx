import { Building2, Factory, Shield, Users } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/shared/page-header'
import { KpiCard } from '@/components/shared/kpi-card'
import { AttendanceChart } from '@/components/charts/attendance-chart'
import { adminService } from '@/services/adminService'
import { isSupabaseConfigured } from '@/lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function SuperAdminDashboardPage() {
  const companies = useQuery({
    queryKey: ['sa', 'companies'],
    queryFn: () => adminService.listCompanies({ pageSize: 100 }),
    enabled: isSupabaseConfigured,
  })

  const companyCount = companies.data?.count ?? 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admin"
        description="Platform-wide overview across all companies."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Companies" value={companyCount} icon={Building2} accent="primary" />
        <KpiCard title="Plants" value="—" icon={Factory} accent="secondary" />
        <KpiCard title="Admins" value="—" icon={Shield} accent="warning" />
        <KpiCard title="Workers" value="—" icon={Users} accent="success" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AttendanceChart
          title="Platform activity"
          type="line"
          color="#1565C0"
          data={[
            { name: 'Week 1', value: companyCount },
            { name: 'Week 2', value: companyCount },
            { name: 'Week 3', value: companyCount },
            { name: 'Week 4', value: companyCount },
          ]}
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent companies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(companies.data?.data ?? []).slice(0, 6).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.code}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {c.subscription_plan ?? 'standard'}
                </span>
              </div>
            ))}
            {!companies.data?.data?.length && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No companies yet. Create one to get started.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
