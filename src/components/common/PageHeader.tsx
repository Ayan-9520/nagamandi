import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-2">
        {eyebrow ? (
          <Badge className="border-gold/40 bg-gold/15 text-gold-foreground">{eyebrow}</Badge>
        ) : null}
        <h1 className="font-display text-3xl leading-none tracking-tight text-balance">{title}</h1>
        <p className="max-w-3xl text-sm leading-6 text-pretty text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
