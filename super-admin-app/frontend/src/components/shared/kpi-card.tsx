import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface KpiCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  trend?: string
  accent?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive'
  className?: string
}

const accentMap = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/15 text-warning-foreground',
  destructive: 'bg-destructive/10 text-destructive',
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  trend,
  accent = 'primary',
  className,
}: KpiCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <motion.p
              key={String(value)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-3xl font-bold tracking-tight"
            >
              {value}
            </motion.p>
            {trend && (
              <p className="mt-1.5 text-xs text-muted-foreground">{trend}</p>
            )}
          </div>
          <div
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl',
              accentMap[accent],
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
