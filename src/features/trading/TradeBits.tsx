import { useEffect, useState } from 'react'
import { toDataURL } from 'qrcode'
import { formatRupee, methodLabel, paymentLabel, requirementLabel, tradeStatusLabel } from '@/features/trading/meta'
import type { PaymentStatus, PriceMethod, RequirementStatus, TradeFigures, TradeRates, TradeStatus } from '@/types/trade'
import { cn } from '@/utils/cn'

const tradeTone: Record<TradeStatus, string> = {
  negotiating: 'bg-sky-100 text-sky-950 dark:bg-sky-950 dark:text-sky-100',
  confirmed: 'bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100',
  documented: 'bg-primary/15 text-primary',
  cancelled: 'bg-destructive/15 text-destructive',
}

const payTone: Record<PaymentStatus, string> = {
  pending: 'bg-gold/25 text-gold-foreground',
  'credit-note': 'bg-sky-100 text-sky-950 dark:bg-sky-950 dark:text-sky-100',
  'debit-note': 'bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100',
  noted: 'bg-muted text-foreground',
}

export function TradeNotice() {
  return (
    <p className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-gold-foreground">
      Sales and buying records follow SOP-002 and SOP-003 as a simulation. Rates are fictional. A parchi is not a receipt, and a payment note does not collect money. Auction and hatha rows are written records, not live bidding.
    </p>
  )
}

export function TradeStatusBadge({ status }: { status: TradeStatus }) {
  return <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', tradeTone[status])}>{tradeStatusLabel(status)}</span>
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', payTone[status])}>{paymentLabel(status)}</span>
}

export function MethodBadge({ method }: { method: PriceMethod }) {
  return <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{methodLabel(method)}</span>
}

export function RequirementBadge({ status }: { status: RequirementStatus }) {
  return <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{requirementLabel(status)}</span>
}

export function FigureList({ figures, rates, unit }: { figures: TradeFigures; rates: TradeRates; unit: string }) {
  const rows = [
    ['Sale value', formatRupee(figures.saleValue)],
    [`Seller commission ${rates.sellerCommissionPercent}%`, formatRupee(figures.sellerCommission)],
    ['Net payable to the seller', formatRupee(figures.sellerNet)],
    [`Buyer commission ${rates.buyerCommissionPercent}%`, formatRupee(figures.buyerCommission)],
    [`Hamali at ${formatRupee(rates.hamaliPerUnit)} per ${unit}`, formatRupee(figures.hamali)],
    ['Transport', formatRupee(figures.transport)],
    ['Due from the buyer', formatRupee(figures.buyerDue)],
  ]
  return (
    <dl className="grid gap-2 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function ParchiQr({ payload }: { payload: string }) {
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    let current = true
    void toDataURL(payload, { margin: 1, width: 160, color: { dark: '#14532d', light: '#ffffff' } }).then((url) => {
      if (current) setSrc(url)
    })
    return () => {
      current = false
    }
  }, [payload])
  if (!src) return <p className="text-sm text-slate-500">Preparing the demonstration mark.</p>
  return <img src={src} alt="" width={160} height={160} className="rounded-md border bg-white p-2" />
}
