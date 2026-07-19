import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { CalendarDays } from 'lucide-react'
import { workerService } from '@/services/workerService'
import { useAuthStore } from '@/store/authStore'
import { dayOfWeekLabel } from '@/utils/date'
import { isSupabaseConfigured } from '@/lib/supabaseClient'

export function WorkerSchedulePage() {
  const userId = useAuthStore((s) => s.user?.id)

  const workerQuery = useQuery({
    queryKey: ['worker', 'me', userId],
    queryFn: () => workerService.getByUserId(userId!),
    enabled: Boolean(userId) && isSupabaseConfigured,
  })

  const scheduleQuery = useQuery({
    queryKey: ['schedule', workerQuery.data?.id],
    queryFn: () => workerService.getSchedule(workerQuery.data!.id),
    enabled: Boolean(workerQuery.data?.id),
  })

  const today = ((new Date().getDay() + 6) % 7) + 1 // Mon=1

  return (
    <div>
      <PageHeader
        title="Today's Schedule"
        description="Your assigned shifts for the week."
      />

      {scheduleQuery.isLoading || workerQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !scheduleQuery.data?.length ? (
        <EmptyState
          icon={CalendarDays}
          title="No schedule assigned"
          description="Ask your admin to assign a weekly schedule."
        />
      ) : (
        <div className="grid gap-3">
          {scheduleQuery.data.map((s) => (
            <Card
              key={s.id}
              className={s.day_of_week === today ? 'border-primary/40 ring-1 ring-primary/20' : ''}
            >
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold">{dayOfWeekLabel(s.day_of_week)}</p>
                  <p className="text-sm text-muted-foreground">
                    {s.is_working_day
                      ? `${s.shift_start.slice(0, 5)} – ${s.shift_end.slice(0, 5)} · ${s.break_minutes}m break`
                      : 'Off day'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {s.day_of_week === today && <Badge>Today</Badge>}
                  <Badge variant={s.is_working_day ? 'success' : 'outline'}>
                    {s.is_working_day ? 'Working' : 'Off'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
