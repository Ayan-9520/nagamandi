import { formatPaise } from '@/services/money'
import { cn } from '@/utils/cn'

export function FinanceNotice() {
  return (
    <p className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-gold-foreground">
      DEMO / SIMULATED. These figures are calculated in this browser. They are not a bank balance, a gateway payment, or a posted ledger.
    </p>
  )
}

export function MoneyBadge({ children, tone = 'muted' }: { children: string; tone?: 'muted' | 'warn' | 'ok' }) {
  const tones = {
    muted: 'bg-muted text-foreground',
    warn: 'bg-gold/25 text-gold-foreground',
    ok: 'bg-primary/15 text-primary',
  }
  return <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', tones[tone])}>{children}</span>
}

export function Paise({ value }: { value: number }) {
  return <span className="font-medium">{formatPaise(value)}</span>
}
