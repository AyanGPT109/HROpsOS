import { format, formatDistanceToNow, isToday, parseISO } from 'date-fns'

export function greetingForNow(date = new Date()): string {
  const hour = date.getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export function formatDate(value: string | Date, pattern = 'dd MMM yyyy'): string {
  const date = typeof value === 'string' ? parseISO(value) : value
  return format(date, pattern)
}

export function formatDateTime(
  value: string | Date,
  pattern = 'dd MMM yyyy, hh:mm a',
): string {
  const date = typeof value === 'string' ? parseISO(value) : value
  return format(date, pattern)
}

export function formatTime(value: string | Date): string {
  return formatDateTime(value, 'hh:mm a')
}

export function relativeTime(value: string | Date): string {
  const date = typeof value === 'string' ? parseISO(value) : value
  if (isToday(date)) {
    return formatDistanceToNow(date, { addSuffix: true })
  }
  return formatDate(date)
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 1).toUpperCase()
  return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
}

export function dayOfWeekLabel(day: number): string {
  const labels = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  return labels[day] ?? `Day ${day}`
}
