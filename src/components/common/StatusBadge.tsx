import { Badge } from '@/components/ui/badge'
import type { LotStatus } from '@/types/domain'
import { cn } from '@/utils/cn'

const tones: Record<LotStatus, string> = {
  'Gate in': 'border-gold/40 bg-gold/15 text-gold-foreground',
  Weighed: 'border-primary/20 bg-primary/10 text-primary',
  'On floor': 'border-chart-4/30 bg-chart-4/10 text-foreground',
  Dispatched: 'border-border bg-muted text-muted-foreground',
}

export function StatusBadge({ status }: { status: LotStatus }) {
  return (
    <Badge variant="outline" className={cn('h-6', tones[status])}>
      {status}
    </Badge>
  )
}
