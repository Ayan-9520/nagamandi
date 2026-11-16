import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { SelectField } from '@/components/forms/SelectField'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SelectItem } from '@/components/ui/select'
import { WarehouseNotice } from '@/features/warehouse/WarehouseBits'
import { canOperateWarehouse, formatUnits, issuedContract, onHand } from '@/services/warehouse-rules'
import { useArrivalStore } from '@/store/arrival-store'
import { useSessionStore } from '@/store/session-store'
import { useWarehouseStore } from '@/store/warehouse-store'

export function StockPage({ kind }: { kind: 'inward' | 'outward' }) {
  const warehouseReady = useWarehouseStore((state) => state.ready)
  const arrivalReady = useArrivalStore((state) => state.ready)
  const ready = warehouseReady && arrivalReady
  const sheds = useWarehouseStore((state) => state.sheds)
  const contracts = useWarehouseStore((state) => state.contracts)
  const moves = useWarehouseStore((state) => state.moves)
  const lots = useArrivalStore((state) => state.lots)
  const moveStock = useWarehouseStore((state) => state.moveStock)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const allocated = sheds.filter((shed) => issuedContract(contracts, shed.id))
  const [shedId, setShedId] = useState('')
  const [lotId, setLotId] = useState('')
  const [quantity, setQuantity] = useState('')
  if (!ready) return <LoadingState label="Loading stock movements" />
  const shed = allocated.find((row) => row.id === shedId) ?? allocated[0]
  const openLots = lots.filter((lot) => lot.status !== 'cancelled')
  const heldLots = openLots.filter((lot) => shed && onHand(moves, shed.id, lot.id) > 0)
  const choices = kind === 'inward' ? openLots : heldLots
  const lot = choices.find((row) => row.id === lotId) ?? choices[0]
  const writer = roleId ? canOperateWarehouse(roleId) : false
  const title = kind === 'inward' ? 'Stock inward' : 'Stock outward'
  const recent = moves.filter((move) => move.kind === kind)

  function submit() {
    if (!roleId || !accountId || !shed || !lot) return
    const result = moveStock({ roleId, accountId }, { kind, shedId: shed.id, lotId: lot.id, quantity, note: '' })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was written. The gate lot status was not changed.`)
      setQuantity('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="SOP-005"
        title={title}
        description={kind === 'inward'
          ? 'Inward quantity cannot pass the lot still outside the sheds, or the free capacity of the shed.'
          : 'Outward quantity cannot pass the stock still in the chosen shed.'}
        actions={<Button type="button" variant="outline" asChild><Link to="/warehouses">Warehouse desk</Link></Button>}
      />
      <WarehouseNotice />
      {writer && shed && lot ? (
        <Card>
          <CardHeader><CardTitle>Record a simulated movement</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <SelectField label="Shed" value={shed.id} onValueChange={(value) => { setShedId(value); setLotId('') }}>
              {allocated.map((row) => <SelectItem key={row.id} value={row.id}>{row.code}</SelectItem>)}
            </SelectField>
            <SelectField label="Produce lot" value={lot.id} onValueChange={setLotId}>
              {choices.map((row) => <SelectItem key={row.id} value={row.id}>{row.lotNo} · {row.commodityName} · {row.quantity} {row.unitSymbol}</SelectItem>)}
            </SelectField>
            <TextField label="Quantity" value={quantity} onChange={(event) => setQuantity(event.target.value)} hint="Greater than zero, at most two decimal places." />
            <div className="flex items-end">
              <Button type="button" onClick={submit}>{kind === 'inward' ? 'Record inward' : 'Record outward'}</Button>
            </div>
          </CardContent>
        </Card>
      ) : <p className="text-sm text-muted-foreground">{writer ? 'No allocated shed has stock for this movement.' : 'This role can read stock and cannot post a movement.'}</p>}
      {recent.map((move) => (
        <article key={move.id} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
          <p className="font-medium">{move.moveNo} · {move.shedCode} · {move.lotNo}</p>
          <p className="mt-1">{formatUnits(move.quantityUnits)} {move.unitSymbol} · {move.commodityName} · {move.partyLabel}</p>
        </article>
      ))}
    </div>
  )
}
