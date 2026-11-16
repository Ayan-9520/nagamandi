import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingState } from '@/components/common/LoadingState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrivalStatusBadge } from '@/features/arrivals/ArrivalBits'
import { formatQty } from '@/features/arrivals/meta'
import { MethodBadge, PaymentBadge, TradeNotice, TradeStatusBadge } from '@/features/trading/TradeBits'
import { formatRupee, tradeStatusLabel } from '@/features/trading/meta'
import { RegistryTable, type RegistryColumn } from '@/features/registry/RegistryTable'
import { canOpenTrade, openQuantity } from '@/services/trade-rules'
import { useArrivalStore } from '@/store/arrival-store'
import { useSessionStore } from '@/store/session-store'
import { useTradeStore } from '@/store/trade-store'
import type { ArrivalLot } from '@/types/arrival'
import { TRADE_STATUSES, type TradeRecord, type TradeStatus } from '@/types/trade'

type Mode = 'arrivals' | 'lots' | 'workspace' | 'negotiations' | 'register' | 'payments'

const copy: Record<Mode, { title: string; description: string }> = {
  arrivals: {
    title: 'Seller arrivals',
    description: 'Lots the seller desks have on the gate. A sale can start only when quantity is still open.',
  },
  lots: {
    title: 'Available produce lots',
    description: 'Available and reserved lots with quantity that is not yet confirmed or documented.',
  },
  workspace: {
    title: 'Aadathiya trading workspace',
    description: 'The commission desk sees every working-mandi lot. The signed-in role is not tied to one aadathiya code.',
  },
  negotiations: {
    title: 'Negotiation records',
    description: 'Written price-discovery notes. An auction record and a hatha record do not open bidding.',
  },
  register: {
    title: 'Trade register',
    description: 'The demonstration record book: seller, buyer, aadathiya, lot, quantity, price, charges and payment status.',
  },
  payments: {
    title: 'Pending payment overview',
    description: 'Documented trades that are not marked noted. A credit note or debit note is a book entry, not a collection.',
  },
}

export function TradingListPage({ mode }: { mode: Mode }) {
  const arrivalsReady = useArrivalStore((state) => state.ready)
  const tradesReady = useTradeStore((state) => state.ready)
  const lots = useArrivalStore((state) => state.lots)
  const trades = useTradeStore((state) => state.trades)
  const roleId = useSessionStore((state) => state.roleId)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<TradeStatus | 'all'>('all')
  const [agent, setAgent] = useState('all')
  const writer = roleId ? canOpenTrade(roleId) : false
  const agents = useMemo(() => {
    const map = new Map<string, string>()
    for (const lot of lots) map.set(lot.aadathiyaId, lot.aadathiyaLabel)
    return [...map.entries()]
  }, [lots])

  const lotRows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return lots.filter((row) => {
      const open = openQuantity(row, trades)
      if (mode === 'lots' && (!(row.status === 'available' || row.status === 'reserved') || open <= 0)) return false
      if (mode === 'workspace' && agent !== 'all' && row.aadathiyaId !== agent) return false
      if (!needle) return true
      return [row.lotNo, row.sellerLabel, row.aadathiyaLabel, row.commodityName, row.vehicleNo].join(' ').toLowerCase().includes(needle)
    })
  }, [lots, trades, mode, query, agent])

  const tradeRows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return trades.filter((row) => {
      if (mode === 'payments' && (row.status !== 'documented' || row.paymentStatus === 'noted')) return false
      if (mode === 'register' && status !== 'all' && row.status !== status) return false
      if (mode === 'negotiations' && row.status === 'cancelled') return false
      if (!needle) return true
      return [row.tradeNo, row.lotNo, row.sellerLabel, row.buyerLabel, row.aadathiyaLabel, row.commodityName].join(' ').toLowerCase().includes(needle)
    })
  }, [trades, mode, query, status])

  if (!arrivalsReady || !tradesReady) return <LoadingState label="Loading the demonstration floor" />

  const lotColumns: RegistryColumn<ArrivalLot>[] = [
    { id: 'seller', header: 'Seller', sortValue: (row) => row.sellerLabel, cell: (row) => row.sellerLabel },
    { id: 'agent', header: 'Aadathiya', sortValue: (row) => row.aadathiyaLabel, cell: (row) => row.aadathiyaLabel },
    { id: 'lot', header: 'Lot', sortValue: (row) => row.lotNo, cell: (row) => row.lotNo },
    { id: 'goods', header: 'Commodity', sortValue: (row) => row.commodityName, cell: (row) => `${row.commodityName} · ${row.gradeName}` },
    { id: 'open', header: 'Still open', sortValue: (row) => openQuantity(row, trades), cell: (row) => formatQty(openQuantity(row, trades), row.unitSymbol) },
    { id: 'status', header: 'Gate', sortValue: (row) => row.status, cell: (row) => <ArrivalStatusBadge status={row.status} /> },
    {
      id: 'action',
      header: 'Open',
      cell: (row) => writer && openQuantity(row, trades) > 0 && (row.status === 'available' || row.status === 'reserved')
        ? <Button type="button" size="sm" variant="outline" asChild><Link to={`/trading/discover/${row.id}`}>Record a rate</Link></Button>
        : <span className="text-xs text-muted-foreground">View only</span>,
    },
  ]

  const tradeColumns: RegistryColumn<TradeRecord>[] = [
    { id: 'trade', header: 'Trade', sortValue: (row) => row.tradeNo, cell: (row) => row.tradeNo },
    { id: 'parties', header: 'Parties', sortValue: (row) => row.sellerLabel, cell: (row) => `${row.sellerLabel} · ${row.buyerLabel} · ${row.aadathiyaLabel}` },
    { id: 'lot', header: 'Lot', sortValue: (row) => row.lotNo, cell: (row) => `${row.lotNo} · ${row.commodityName}` },
    { id: 'qty', header: 'Quantity', sortValue: (row) => row.quantity, cell: (row) => formatQty(row.quantity, row.unitSymbol) },
    { id: 'price', header: 'Price', sortValue: (row) => row.price, cell: (row) => formatRupee(row.price) },
    { id: 'method', header: 'Discovery', sortValue: (row) => row.method, cell: (row) => <MethodBadge method={row.method} /> },
    { id: 'pay', header: 'Payment', sortValue: (row) => row.paymentStatus, cell: (row) => <PaymentBadge status={row.paymentStatus} /> },
    { id: 'status', header: 'Status', sortValue: (row) => row.status, cell: (row) => <TradeStatusBadge status={row.status} /> },
    { id: 'open', header: 'Open', cell: (row) => <Button type="button" size="sm" variant="outline" asChild><Link to={`/trading/${row.id}`}>Open</Link></Button> },
  ]

  const showLots = mode === 'arrivals' || mode === 'lots' || mode === 'workspace'

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="DEMO · floor"
        title={copy[mode].title}
        description={copy[mode].description}
        actions={<Button type="button" variant="outline" asChild><Link to="/trading">Trading desk</Link></Button>}
      />
      <TradeNotice />
      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="trade-search">Search</Label>
          <Input id="trade-search" value={query} placeholder="Lot, desk code or trade number" onChange={(event) => setQuery(event.target.value)} />
        </div>
        {mode === 'workspace' ? (
          <div className="grid gap-1.5">
            <Label>Aadathiya</Label>
            <Select value={agent} onValueChange={setAgent}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All aadathiya desks</SelectItem>
                {agents.map(([id, label]) => <SelectItem key={id} value={id}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        ) : null}
        {mode === 'register' ? (
          <div className="grid gap-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as TradeStatus | 'all')}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {TRADE_STATUSES.map((item) => <SelectItem key={item} value={item}>{tradeStatusLabel(item)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>
      {showLots ? (
        <RegistryTable columns={lotColumns} rows={lotRows} getRowId={(row) => row.id} caption={copy[mode].title} emptyTitle="No lot in this view" emptyDescription="Restore the arrival sample if the gate book was cleared." resetKey={`${query}:${agent}`} />
      ) : (
        <RegistryTable columns={tradeColumns} rows={tradeRows} getRowId={(row) => row.id} caption={copy[mode].title} emptyTitle="No trade in this view" emptyDescription="Record a rate from an open lot, or restore the trade sample." resetKey={`${query}:${status}`} />
      )}
    </div>
  )
}
