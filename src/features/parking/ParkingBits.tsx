import { slotLabel } from '@/features/parking/meta'
import { slotState } from '@/services/parking-rules'
import type { Slot, SlotState, Visit } from '@/types/parking'
import { cn } from '@/utils/cn'

export function ParkingNotice() {
  return (
    <p className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-gold-foreground">
      DEMO / SIMULATED. Contracts, visits, passes, deposits and rent stay in this browser. They are not a deed, a gate pass, or a collected fee.
    </p>
  )
}

export function ParkingBadge({ children, tone = 'muted' }: { children: string; tone?: 'muted' | 'warn' | 'ok' }) {
  const tones = {
    muted: 'bg-muted text-foreground',
    warn: 'bg-gold/25 text-gold-foreground',
    ok: 'bg-primary/15 text-primary',
  }
  return <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', tones[tone])}>{children}</span>
}

const tones: Record<SlotState, string> = {
  available: 'bg-primary/10 text-primary ring-primary/30',
  occupied: 'bg-amber-200 text-amber-950 ring-amber-400',
  reserved: 'bg-sky-100 text-sky-950 ring-sky-400',
}

export function SlotGrid({ slots, visits }: { slots: Slot[]; visits: Visit[] }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 text-xs">
        {(['available', 'occupied', 'reserved'] as const).map((state) => (
          <span key={state} className={cn('rounded-md px-2 py-1 ring-1', tones[state])}>{slotLabel(state)}</span>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {slots.map((slot) => {
          const state = slotState(visits, slot.id)
          return (
            <div key={slot.id} className={cn('rounded-lg px-2 py-3 text-center ring-1', tones[state])}>
              <p className="font-medium">{slot.code}</p>
              <p className="text-xs">{slotLabel(state)}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
