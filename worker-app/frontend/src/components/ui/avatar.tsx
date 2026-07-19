import { cn } from '@/lib/utils'
import { getInitials } from '@/utils/date'

interface AvatarProps {
  src?: string | null
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          'rounded-full object-cover ring-2 ring-border',
          sizes[size],
          className,
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ring-2 ring-border',
        sizes[size],
        className,
      )}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  )
}
