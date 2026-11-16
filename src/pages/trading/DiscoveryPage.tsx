import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { SelectField } from '@/components/forms/SelectField'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SelectItem } from '@/components/ui/select'
import { formatQty } from '@/features/arrivals/meta'
import { FigureList, TradeNotice } from '@/features/trading/TradeBits'
import { methodLabel, methodNote } from '@/features/trading/meta'
import { canOpenTrade, canTradeLot, openQuantity, quoteTrade } from '@/services/trade-rules'
import { workingMandi } from '@/services/registry-rules'
import { useArrivalStore } from '@/store/arrival-store'
import { useRegistryStore } from '@/store/registry-store'
import { useSessionStore } from '@/store/session-store'
import { useTradeStore } from '@/store/trade-store'
import { PRICE_METHODS, type PriceMethod } from '@/types/trade'

function readNumber(value: string) {
  const text = value.trim()
  if (!text) return Number.NaN
  return Number(text)
}

export function DiscoveryPage() {
  const { lotId = '' } = useParams()
  const navigate = useNavigate()
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const arrivalsReady = useArrivalStore((state) => state.ready)
  const registryReady = useRegistryStore((state) => state.ready)
  const tradeReady = useTradeStore((state) => state.ready)
  const lots = useArrivalStore((state) => state.lots)
  const trades = useTradeStore((state) => state.trades)
  const rates = useTradeStore((state) => state.rates)
  const parties = useRegistryStore((state) => state.parties)
  const locations = useRegistryStore((state) => state.locations)
  const openTrade = useTradeStore((state) => state.openTrade)
  const [chosenLot, setChosenLot] = useState(lotId)
  const [buyerId, setBuyerId] = useState('')
  const [method, setMethod] = useState<PriceMethod>('negotiated')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [transport, setTransport] = useState('0')
  const [note, setNote] = useState('')

  if (!arrivalsReady || !registryReady || !tradeReady || !roleId || !accountId) return <LoadingState label="Loading price discovery" />
  if (!canOpenTrade(roleId)) {
    return <EmptyState title="Another desk records the rate" description="An aadathiya, mandi manager or super admin desk writes the price record." actionLabel="Trading desk" onAction={() => navigate('/trading')} />
  }
  const mandi = workingMandi(locations)
  const buyers = parties.filter((row) => row.kind === 'buyer' && row.status === 'Active' && row.mandiId === mandi?.id)
  const openLots = lots.filter((row) => canTradeLot(row, trades))
  if (!mandi || buyers.length === 0 || openLots.length === 0) {
    return <EmptyState title="No lot is open" description="Confirm a gate lot is available or reserved with quantity still uncommitted." actionLabel="Available lots" onAction={() => navigate('/trading/lots')} />
  }
  const selectedLotId = openLots.some((row) => row.id === chosenLot) ? chosenLot : openLots[0].id
  const lot = openLots.find((row) => row.id === selectedLotId) ?? openLots[0]
  const selectedBuyer = buyers.some((row) => row.id === buyerId) ? buyerId : buyers[0].id
  const qty = readNumber(quantity)
  const rate = readNumber(price)
  const haul = readNumber(transport)
  const preview = Number.isFinite(qty) && qty > 0 && Number.isFinite(rate) && rate > 0 && Number.isFinite(haul) && haul >= 0
    ? quoteTrade(qty, rate, haul, rates)
    : null

  function submit() {
    if (!roleId || !accountId) return
    const result = openTrade({ roleId, accountId }, {
      lotId: lot.id,
      buyerId: selectedBuyer,
      method,
      quantity: readNumber(quantity),
      price: readNumber(price),
      transport: readNumber(transport),
      note,
    })
    if (!result.ok) {
      toast.error(result.message)
      return
    }
    toast.success(`${result.id} was saved as a written rate. Bidding is not open.`)
    navigate(`/trading/${result.id}`)
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="DEMO · price discovery"
        title="Price discovery"
        description="Record a negotiated sale, an auction note, or a hatha note. Nothing on this screen accepts a live bid."
        actions={<Button type="button" variant="outline" asChild><Link to="/trading">Trading desk</Link></Button>}
      />
      <TradeNotice />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <Card>
          <CardHeader><CardTitle>Written rate</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <SelectField label="Lot" value={lot.id} onValueChange={setChosenLot}>
              {openLots.map((row) => <SelectItem key={row.id} value={row.id}>{row.lotNo} · {row.commodityName} · {formatQty(openQuantity(row, trades), row.unitSymbol)} open</SelectItem>)}
            </SelectField>
            <SelectField label="Buyer" value={selectedBuyer} onValueChange={setBuyerId}>
              {buyers.map((row) => <SelectItem key={row.id} value={row.id}>{row.label}</SelectItem>)}
            </SelectField>
            <SelectField label="Method" value={method} onValueChange={(value) => setMethod(value as PriceMethod)}>
              {PRICE_METHODS.map((item) => <SelectItem key={item} value={item}>{methodLabel(item)}</SelectItem>)}
            </SelectField>
            <TextField label="Quantity" value={quantity} hint={`Still open: ${formatQty(openQuantity(lot, trades), lot.unitSymbol)}. Greater than zero.`} onChange={(event) => setQuantity(event.target.value)} />
            <TextField label="Price per unit" value={price} hint="Rupees. Greater than zero. Two decimal places at most." onChange={(event) => setPrice(event.target.value)} />
            <TextField label="Transport" value={transport} hint="Rupees charged to the buyer. Zero is allowed." onChange={(event) => setTransport(event.target.value)} />
            <div className="md:col-span-2">
              <TextField label="Negotiation note" value={note} hint={methodNote(method)} onChange={(event) => setNote(event.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Button type="button" onClick={submit}>Save the written rate</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Calculation preview</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{lot.sellerLabel} · {lot.aadathiyaLabel} · {lot.commodityName} · {lot.gradeName}</p>
            {preview ? <FigureList figures={preview} rates={rates} unit={lot.unitSymbol} /> : <p className="text-sm text-muted-foreground">Enter a quantity and a price to preview the fictional commission, hamali and buyer total.</p>}
            <p className="text-xs leading-5 text-muted-foreground">Seller commission is deducted from the seller. Buyer commission, hamali and transport are added for the buyer. The same hamali is not deducted again from the seller.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
