import { useSearchParams } from 'react-router-dom'
import { TextField } from '@/components/forms/TextField'
import { COMMAND_DAY } from '@/services/compliance-rules'
import type { SopStatus } from '@/types/compliance'
import { cn } from '@/utils/cn'

export function CommandNotice() {
  return (
    <p className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-gold-foreground">
      DEMO / SIMULATED. This command centre reads the books in this browser. Audit rows are demo records, not authoritative evidence. No finding is filed with an authority.
    </p>
  )
}

export function SopBadge({ status }: { status: SopStatus }) {
  const label = status === 'on-track' ? 'On track' : status === 'attention' ? 'Attention' : 'Exception'
  const tone = status === 'on-track' ? 'bg-primary/15 text-primary' : status === 'attention' ? 'bg-gold/25 text-gold-foreground' : 'bg-destructive/15 text-destructive'
  return <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', tone)}>{label}</span>
}

export function useCommandQuery() {
  const [params, setParams] = useSearchParams()
  const from = params.get('from') || '2026-11-01'
  const to = params.get('to') || COMMAND_DAY
  const q = params.get('q') || ''

  function setField(key: 'from' | 'to' | 'q', value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  return { from, to, q, setField }
}

export function CommandFilters() {
  const { from, to, q, setField } = useCommandQuery()
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <TextField label="From" value={from} onChange={(event) => setField('from', event.target.value)} hint="YYYY-MM-DD" />
      <TextField label="To" value={to} onChange={(event) => setField('to', event.target.value)} hint="The expiry window uses this day." />
      <TextField label="Search" value={q} onChange={(event) => setField('q', event.target.value)} hint="SOP, desk code, or title." />
    </div>
  )
}

export function matchesQuery(query: string, parts: string[]) {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return parts.join(' ').toLowerCase().includes(needle)
}
