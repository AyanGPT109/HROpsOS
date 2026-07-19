import { cn } from '@/lib/utils'

export interface MultiSelectOption {
  value: string
  label: string
  hint?: string
}

interface MultiSelectProps {
  label?: string
  options: MultiSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  error?: string
  disabled?: boolean
  emptyMessage?: string
  className?: string
}

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  error,
  disabled,
  emptyMessage = 'No options available',
  className,
}: MultiSelectProps) {
  const toggle = (id: string) => {
    if (disabled) return
    if (value.includes(id)) onChange(value.filter((v) => v !== id))
    else onChange([...value, id])
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <p className="text-sm font-medium">{label}</p>}
      <div
        className={cn(
          'max-h-48 space-y-1 overflow-y-auto rounded-xl border border-input bg-card p-2',
          error && 'border-destructive',
          disabled && 'opacity-60',
        )}
      >
        {options.length === 0 ? (
          <p className="px-2 py-3 text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          options.map((opt) => {
            const checked = value.includes(opt.value)
            return (
              <label
                key={opt.value}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 transition hover:bg-muted/60',
                  checked && 'bg-primary/5',
                )}
              >
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggle(opt.value)}
                />
                <span>
                  <span className="block text-sm font-medium">{opt.label}</span>
                  {opt.hint && (
                    <span className="block text-xs text-muted-foreground">{opt.hint}</span>
                  )}
                </span>
              </label>
            )
          })
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {value.length > 0 && (
        <p className="text-xs text-muted-foreground">{value.length} selected</p>
      )}
    </div>
  )
}
