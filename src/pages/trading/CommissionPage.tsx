import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingState } from '@/components/common/LoadingState'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FigureList, TradeNotice } from '@/features/trading/TradeBits'
import { formatRupee } from '@/features/trading/meta'
import { quoteTrade } from '@/services/trade-rules'
import { useTradeStore } from '@/store/trade-store'

function readNumber(value: string) {
  const text = value.trim()
  if (!text) return Number.NaN
  return Number(text)
}

export function CommissionPage() {
  const ready = useTradeStore((state) => state.ready)
  const rates = useTradeStore((state) => state.rates)
  const trades = useTradeStore((state) => state.trades)
  const [quantity, setQuantity] = useState('4.2')
  const [price, setPrice] = useState('8600')
  const [transport, setTransport] = useState('180')
  if (!ready) return <LoadingState label="Loading the commission preview" />
  const preview = quoteTrade(readNumber(quantity), readNumber(price), readNumber(transport), rates)
  const valid = Number.isFinite(preview.saleValue) && preview.saleValue > 0
  const documented = trades.filter((row) => row.status === 'documented')
  const sellerTotal = documented.reduce((sum, row) => sum + row.figures.sellerCommission, 0)
  const buyerTotal = documented.reduce((sum, row) => sum + row.figures.buyerCommission, 0)

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="DEMO · commission"
        title="Commission calculation preview"
        description="Seller commission is deducted from the sale. Buyer commission is added to the amount due. Both rates are fictional."
        actions={<Button type="button" variant="outline" asChild><Link to="/trading/charges">Edit fictional rates</Link></Button>}
      />
      <TradeNotice />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Try a figure</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <TextField label="Quantity" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
            <TextField label="Price per unit" value={price} onChange={(event) => setPrice(event.target.value)} />
            <TextField label="Transport" value={transport} onChange={(event) => setTransport(event.target.value)} />
            <p className="text-sm text-muted-foreground">Using seller {rates.sellerCommissionPercent}% and buyer {rates.buyerCommissionPercent}%, hamali {formatRupee(rates.hamaliPerUnit)} per unit.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
          <CardContent>
            {valid ? <FigureList figures={preview} rates={rates} unit="unit" /> : <p className="text-sm text-muted-foreground">Enter a quantity and a price above zero.</p>}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Documented trades</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Seller commission on documented trades: {formatRupee(sellerTotal)}. Buyer commission: {formatRupee(buyerTotal)}.</p>
          {documented.map((row) => (
            <p key={row.id}>{row.tradeNo} · sale {formatRupee(row.figures.saleValue)} · seller {formatRupee(row.figures.sellerCommission)} · buyer {formatRupee(row.figures.buyerCommission)}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
