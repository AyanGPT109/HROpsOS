import { PageHeader } from '@/components/shared/page-header'
import { AttendanceChart } from '@/components/charts/attendance-chart'
import { KpiCard } from '@/components/shared/kpi-card'
import { Activity, Building2, TrendingUp, Users } from 'lucide-react'

export function SuperAdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Cross-company workforce insights."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Active companies" value="—" icon={Building2} />
        <KpiCard title="Active workers" value="—" icon={Users} accent="success" />
        <KpiCard title="Avg attendance" value="—" icon={TrendingUp} accent="secondary" />
        <KpiCard title="Geo events (7d)" value="—" icon={Activity} accent="warning" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <AttendanceChart
          title="Monthly attendance"
          data={[
            { name: 'Jan', value: 0 },
            { name: 'Feb', value: 0 },
            { name: 'Mar', value: 0 },
            { name: 'Apr', value: 0 },
            { name: 'May', value: 0 },
            { name: 'Jun', value: 0 },
          ]}
        />
        <AttendanceChart
          title="Plant distribution"
          type="line"
          color="#26A69A"
          data={[
            { name: 'North', value: 0 },
            { name: 'South', value: 0 },
            { name: 'East', value: 0 },
            { name: 'West', value: 0 },
          ]}
        />
      </div>
    </div>
  )
}
