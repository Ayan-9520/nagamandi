import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import { RequirementBadge, TradeNotice } from '@/features/trading/TradeBits'
import { canFileRequirement, validateRequirementQuantity } from '@/services/trade-rules'
import { workingMandi } from '@/services/registry-rules'
import { useRegistryStore } from '@/store/registry-store'
import { useSessionStore } from '@/store/session-store'
import { useTradeStore } from '@/store/trade-store'

function readNumber(value: string) {
  const text = value.trim()
  if (!text) return Number.NaN
  return Number(text)
}

export function RequirementPage() {
  const navigate = useNavigate()
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const registryReady = useRegistryStore((state) => state.ready)
  const tradeReady = useTradeStore((state) => state.ready)
  const parties = useRegistryStore((state) => state.parties)
  const commodities = useRegistryStore((state) => state.commodities)
  const units = useRegistryStore((state) => state.units)
  const locations = useRegistryStore((state) => state.locations)
  const requirements = useTradeStore((state) => state.requirements)
  const fileRequirement = useTradeStore((state) => state.fileRequirement)
  const setRequirement = useTradeStore((state) => state.setRequirement)
  const [buyerId, setBuyerId] = useState('')
  const [commodityId, setCommodityId] = useState('')
  const [unitId, setUnitId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')

  if (!registryReady || !tradeReady || !roleId || !accountId) return <LoadingState label="Loading buyer requirements" />
  const mandi = workingMandi(locations)
  const buyers = parties.filter((row) => row.kind === 'buyer' && row.status === 'Active' && row.mandiId === mandi?.id)
  const goods = commodities.filter((row) => row.status === 'Active' && row.mandiId === mandi?.id)
  const measures = units.filter((row) => row.status === 'Active' && row.mandiId === mandi?.id)
  if (!mandi || buyers.length === 0 || goods.length === 0 || measures.length === 0) {
    return <EmptyState title="The floor needs a buyer register" description="The working mandi needs an active buyer, commodity and unit." actionLabel="Trading desk" onAction={() => navigate('/trading')} />
  }
  const selectedBuyer = buyerId || buyers[0].id
  const selectedCommodity = commodityId || goods[0].id
  const selectedUnit = unitId || measures.find((row) => row.symbol === 'q')?.id || measures[0].id
  const writer = canFileRequirement(roleId)

  function submit() {
    if (!roleId || !accountId) return
    const result = fileRequirement({ roleId, accountId }, {
      buyerId: selectedBuyer,
      commodityId: selectedCommodity,
      unitId: selectedUnit,
      quantity: readNumber(quantity),
      note,
    })
    if (!result.ok) {
      toast.error(result.message)
      return
    }
    toast.success(`${result.id} was saved in this browser.`)
    setQuantity('')
    setNote('')
  }

  function mark(id: string, status: 'matched' | 'withdrawn') {
    if (!roleId || !accountId) return
    const result = setRequirement({ roleId, accountId }, id, status)
    if (!result.ok) toast.error(result.message)
    else toast.success(status === 'matched' ? 'The requirement was marked matched.' : 'The requirement was withdrawn.')
  }

  const previewError = quantity.trim() ? validateRequirementQuantity(readNumber(quantity)) : null

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="DEMO · SOP-003"
        title="Buyer requirements"
        description="A buyer desk records what it wants. Matching a requirement does not create a sale."
        actions={<Button type="button" variant="outline" asChild><Link to="/trading">Trading desk</Link></Button>}
      />
      <TradeNotice />
      {writer ? (
        <Card>
          <CardHeader><CardTitle>New requirement</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <SelectField label="Buyer" value={selectedBuyer} onValueChange={setBuyerId}>
              {buyers.map((row) => <SelectItem key={row.id} value={row.id}>{row.label}</SelectItem>)}
            </SelectField>
            <SelectField label="Commodity" value={selectedCommodity} onValueChange={setCommodityId}>
              {goods.map((row) => <SelectItem key={row.id} value={row.id}>{row.name}</SelectItem>)}
            </SelectField>
            <SelectField label="Unit" value={selectedUnit} onValueChange={setUnitId}>
              {measures.map((row) => <SelectItem key={row.id} value={row.id}>{row.name} ({row.symbol})</SelectItem>)}
            </SelectField>
            <TextField label="Quantity" value={quantity} hint={previewError ?? 'Greater than zero. At most three decimal places.'} onChange={(event) => setQuantity(event.target.value)} />
            <TextField label="Requirement note" value={note} hint="At least 8 characters." onChange={(event) => setNote(event.target.value)} />
            <div className="flex items-end">
              <Button type="button" onClick={submit}>Save requirement</Button>
            </div>
          </CardContent>
        </Card>
      ) : <p className="text-sm text-muted-foreground">This role can read requirements. A buyer, aadathiya, manager or super admin desk can file one.</p>}
      <div className="space-y-2">
        {requirements.map((row) => (
          <article key={row.id} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{row.requirementNo} · {row.buyerLabel}</p>
              <RequirementBadge status={row.status} />
            </div>
            <p className="mt-1">{row.commodityName} · {formatQty(row.quantity, row.unitSymbol)}</p>
            <p className="mt-1 text-muted-foreground">{row.note}</p>
            {writer && row.status === 'open' ? (
              <div className="mt-2 flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => mark(row.id, 'matched')}>Mark matched</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => mark(row.id, 'withdrawn')}>Withdraw</Button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  )
}
