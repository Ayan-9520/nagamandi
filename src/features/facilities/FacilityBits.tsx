import { cn } from '@/utils/cn'

export function FacilityNotice() {
  return (
    <p className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-gold-foreground">
      DEMO / SIMULATED. Leases, stays, deposits and inspections stay in this browser. They are not a deed, a booking, or a collected rent. Guest codes are fictional.
    </p>
  )
}

export function FacilityBadge({ children, tone = 'muted' }: { children: string; tone?: 'muted' | 'warn' | 'ok' }) {
  const tones = {
    muted: 'bg-muted text-foreground',
    warn: 'bg-gold/25 text-gold-foreground',
    ok: 'bg-primary/15 text-primary',
  }
  return <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', tones[tone])}>{children}</span>
}
