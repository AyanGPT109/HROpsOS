import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { NavItem } from '@/layouts/sidebar'
import { useUiStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

interface CommandPaletteProps {
  items: NavItem[]
}

export function CommandPalette({ items }: CommandPaletteProps) {
  const open = useUiStore((s) => s.commandOpen)
  const setOpen = useUiStore((s) => s.setCommandOpen)
  const navigate = useNavigate()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(!open)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-foreground/40 p-4 pt-[15vh] backdrop-blur-[2px]">
      <div
        className="absolute inset-0"
        onClick={() => setOpen(false)}
      />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-elevated">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-medium text-muted-foreground">Quick navigation</p>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {items.map((item) => (
            <button
              key={item.to}
              type="button"
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium hover:bg-muted',
              )}
              onClick={() => {
                navigate(item.to)
                setOpen(false)
              }}
            >
              <item.icon className="h-4 w-4 text-muted-foreground" />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
