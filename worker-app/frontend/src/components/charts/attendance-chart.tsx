import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ChartPoint {
  name: string
  value: number
  value2?: number
}

interface AttendanceChartProps {
  title: string
  data: ChartPoint[]
  type?: 'bar' | 'line'
  color?: string
}

export function AttendanceChart({
  title,
  data,
  type = 'bar',
  color = '#1565C0',
}: AttendanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-72 pl-0">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
              <YAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-card)',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
              <YAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-card)',
                }}
              />
              <Bar dataKey="value" fill={color} radius={[8, 8, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
