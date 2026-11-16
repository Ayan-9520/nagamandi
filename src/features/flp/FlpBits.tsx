import { cn } from '@/utils/cn'

export function FlpNotice() {
  return (
    <p className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-gold-foreground">
      DEMO / SIMULATED. Intake, batches, grades, packs and output stay in this browser. They are not a process certificate, a lab result, or a live packing line.
    </p>
  )
}

export function FlpBadge({ children, tone = 'muted' }: { children: string; tone?: 'muted' | 'warn' | 'ok' }) {
  const tones = {
    muted: 'bg-muted text-foreground',
    warn: 'bg-gold/25 text-gold-foreground',
    ok: 'bg-primary/15 text-primary',
  }
  return <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', tones[tone])}>{children}</span>
}
