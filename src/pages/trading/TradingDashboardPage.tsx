import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MethodBadge, TradeNotice, TradeStatusBadge } from '@/features/trading/TradeBits'
import { formatRupee, methodLabel } from '@/features/trading/meta'
import { useTradeStore } from '@/store/trade-store'
import { ClipboardList, HandCoins, Scale, ScrollText } from 'lucide-react'

const links = [
  { to: '/trading/arrivals', label: 'Seller arrivals', detail: 'Lots brought to the floor under SOP-002' },
  { to: '/trading/requirements', label: 'Buyer requirements', detail: 'What a buyer desk has asked to purchase' },
  { to: '/trading/lots', label: 'Available produce lots', detail: 'Quantity still open for a written rate' },
  { to: '/trading/workspace', label: 'Aadathiya workspace', detail: 'Lots grouped for the commission desk' },
  { to: '/trading/discover', label: 'Price discovery', detail: 'Negotiated sale, auction record, or hatha record' },
  { to: '/trading/negotiations', label: 'Negotiation records', detail: 'Written notes. Bidding stays closed' },
  { to: '/trading/commission', label: 'Commission preview', detail: 'Fictional seller and buyer percentages' },
  { to: '/trading/charges', label: 'Hamali and transport', detail: 'Fictional labour rate and per-trade transport' },
  { to: '/trading/register', label: 'Trade register', detail: 'The aadathiya record book in this browser' },
  { to: '/trading/payments', label: 'Pending payments', detail: 'Credit notes, debit notes, and amounts still unmarked' },
]

export function TradingDashboardPage() {
  const ready = useTradeStore((state) => state.ready)
  const trades = useTradeStore((state) => state.trades)
  const requirements = useTradeStore((state) => state.requirements)
  const resetTrades = useTradeStore((state) => state.resetTrades)
  const [restoreOpen, setRestoreOpen] = useState(false)
  const counts = useMemo(() => ({
    negotiating: trades.filter((row) => row.status === 'negotiating').length,
    confirmed: trades.filter((row) => row.status === 'confirmed').length,
    documented: trades.filter((row) => row.status === 'documented').length,
    openNeeds: requirements.filter((row) => row.status === 'open').length,
  }), [trades, requirements])
  if (!ready) return <LoadingState label="Loading the demonstration floor" />
  const pending = trades.filter((row) => row.status === 'documented' && row.paymentStatus !== 'noted')

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="DEMO · SOP-002 · SOP-003"
        title="Trading"
        description="Seller sales and buyer purchases for the sample day. Parchis, commission and charges stay in this browser."
        actions={<Button type="button" variant="outline" onClick={() => setRestoreOpen(true)}>Restore trade sample</Button>}
      />
      <TradeNotice />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Negotiating" value={String(counts.negotiating)} hint="Price notes not yet confirmed" icon={Scale} />
        <StatCard label="Confirmed" value={String(counts.confirmed)} hint="Waiting for parchis" icon={ClipboardList} />
        <StatCard label="Documented" value={String(counts.documented)} hint="Seller and buyer parchis" icon={ScrollText} />
        <StatCard label="Open requirements" value={String(counts.openNeeds)} hint="Buyer desks still asking" icon={HandCoins} />
      </div>
      <section className="space-y-3">
        <h2 className="font-display text-2xl tracking-tight">Floor steps</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {links.map((item) => (
            <Link key={item.to} to={item.to} className="rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10 transition-colors hover:bg-accent">
              <span className="block text-sm font-medium">{item.label}</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.detail}</span>
            </Link>
          ))}
        </div>
      </section>
      <Card>
        <CardHeader><CardTitle>Latest records</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {trades.slice(0, 4).map((row) => (
            <Link key={row.id} to={`/trading/${row.id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 hover:bg-accent">
              <span>{row.tradeNo} · {row.sellerLabel} · {row.buyerLabel} · {row.commodityName}</span>
              <span className="flex flex-wrap items-center gap-2">
                <MethodBadge method={row.method} />
                <TradeStatusBadge status={row.status} />
                <span className="text-xs text-muted-foreground">{formatRupee(row.figures.saleValue)}</span>
              </span>
            </Link>
          ))}
          <p className="text-xs text-muted-foreground">Pending buyer amounts on documented trades: {formatRupee(pending.reduce((sum, row) => sum + row.figures.buyerDue, 0))}. {methodLabel('auction-record')} and {methodLabel('hatha')} do not open a session.</p>
        </CardContent>
      </Card>
      <Dialog open={restoreOpen} onOpenChange={setRestoreOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore the trade sample?</DialogTitle>
            <DialogDescription>This replaces trades, requirements and fictional rates stored in this browser. Gate lots, stakeholder registers and licence cases stay.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRestoreOpen(false)}>Keep current trades</Button>
            <Button type="button" onClick={() => { resetTrades(); setRestoreOpen(false); toast.success('The trade sample was restored in this browser.') }}>Restore sample</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
