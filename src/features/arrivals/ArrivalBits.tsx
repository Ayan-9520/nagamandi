import { useEffect, useState } from 'react'
import { toDataURL } from 'qrcode'
import { statusLabel } from '@/features/arrivals/meta'
import type { ArrivalStatus } from '@/types/arrival'
import { cn } from '@/utils/cn'

const tone: Record<ArrivalStatus, string> = {
  arrived: 'bg-sky-100 text-sky-950 dark:bg-sky-950 dark:text-sky-100',
  'under-inspection': 'bg-gold/25 text-gold-foreground',
  available: 'bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100',
  reserved: 'bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100',
  sold: 'bg-primary/15 text-primary',
  dispatched: 'bg-muted text-foreground',
  cancelled: 'bg-destructive/15 text-destructive',
}

export function ArrivalStatusBadge({ status }: { status: ArrivalStatus }) {
  return <span className={cn('inline-flex max-w-full rounded-full px-2 py-0.5 text-xs leading-4 font-medium whitespace-normal', tone[status])}>{statusLabel(status)}</span>
}

export function ArrivalNotice() {
  return (
    <p className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-gold-foreground">
      Gate lots, weighment and QR codes are simulated. A slip is not a gate pass, and a sold mark does not collect a payment.
    </p>
  )
}

export function LotQr({ payload }: { payload: string }) {
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    let current = true
    void toDataURL(payload, { margin: 1, width: 180, color: { dark: '#14532d', light: '#ffffff' } }).then((url) => {
      if (current) setSrc(url)
    })
    return () => {
      current = false
    }
  }, [payload])
  if (!src) return <p className="text-sm text-muted-foreground">Preparing the demonstration QR code.</p>
  return <img src={src} alt="" width={180} height={180} className="rounded-md border bg-white p-2" />
}
