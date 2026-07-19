import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const areaId = id ?? props.name
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={areaId} className="text-sm font-medium">
            {label}
          </label>
        )}
        <textarea
          id={areaId}
          ref={ref}
          className={cn(
            'flex min-h-[100px] w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm',
            'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'
