import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { CalendarRange } from 'lucide-react'

export function AdminSchedulesPage() {
  return (
    <div>
      <PageHeader
        title="Schedules"
        description="Assign weekly shifts to workers by plant."
      />
      <Card>
        <CardHeader>
          <CardTitle>Worker schedules</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={CalendarRange}
            title="Schedule management"
            description="Select a worker from the Workers page to assign Mon–Sun shift timings via workerService.assignSchedule()."
          />
        </CardContent>
      </Card>
    </div>
  )
}
