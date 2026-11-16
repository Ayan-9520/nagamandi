import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  icon?: ReactNode
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed bg-muted/40 px-4 py-8 sm:px-6">
      <span className="grid size-10 place-items-center rounded-lg bg-background text-primary ring-1 ring-border">
        {icon ?? <Inbox className="size-5" aria-hidden />}
      </span>
      <div className="space-y-1">
        <h2 className="text-base font-medium">{title}</h2>
        <p className="max-w-xl text-sm text-muted-foreground">{description}</p>
      </div>
      {actionLabel && onAction ? (
        <Button type="button" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
