import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Bell } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { relativeTime } from '@/utils/date'
import { cn } from '@/lib/utils'

export function WorkerNotificationsPage() {
  const { notifications, isLoading, markAsRead, markAllAsRead } = useNotifications()

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Alerts about attendance, leaves, and geofence events."
        actions={
          <Button variant="outline" onClick={() => void markAllAsRead()}>
            Mark all read
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All caught up"
          description="You have no notifications right now."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={cn(!n.is_read && 'border-primary/30 bg-primary/[0.03]')}
            >
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold">{n.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {relativeTime(n.created_at)}
                  </p>
                </div>
                {!n.is_read && (
                  <Button size="sm" variant="ghost" onClick={() => void markAsRead(n.id)}>
                    Mark read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
