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
import { ColdNotice } from '@/features/cold-storage/ColdBits'
import { canOperateCold, formatUnits, issuedContract, onHand } from '@/services/cold-rules'
import { useArrivalStore } from '@/store/arrival-store'
import { useColdStore } from '@/store/cold-store'
import { useSessionStore } from '@/store/session-store'

export function StockPage({ kind }: { kind: 'inward' | 'outward' }) {
  const coldReady = useColdStore((state) => state.ready)
  const arrivalReady = useArrivalStore((state) => state.ready)
  const ready = coldReady && arrivalReady
  const chambers = useColdStore((state) => state.chambers)
  const contracts = useColdStore((state) => state.contracts)
  const moves = useColdStore((state) => state.moves)
  const lots = useArrivalStore((state) => state.lots)
  const moveStock = useColdStore((state) => state.moveStock)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const allocated = chambers.filter((chamber) => issuedContract(contracts, chamber.id))
  const [chamberId, setChamberId] = useState('')
  const [lotId, setLotId] = useState('')
  const [quantity, setQuantity] = useState('')
  if (!ready) return <LoadingState label="Loading stock movements" />
  const chamber = allocated.find((row) => row.id === chamberId) ?? allocated[0]
  const openLots = lots.filter((lot) => lot.status !== 'cancelled')
  const heldLots = openLots.filter((lot) => chamber && onHand(moves, chamber.id, lot.id) > 0)
  const choices = kind === 'inward' ? openLots : heldLots
  const lot = choices.find((row) => row.id === lotId) ?? choices[0]
  const writer = roleId ? canOperateCold(roleId) : false
  const title = kind === 'inward' ? 'Stock inward' : 'Stock outward'
  const recent = moves.filter((move) => move.kind === kind)

  function submit() {
    if (!roleId || !accountId || !chamber || !lot) return
    const result = moveStock({ roleId, accountId }, { kind, chamberId: chamber.id, lotId: lot.id, quantity, note: '' })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was written. The gate lot status was not changed, and the warehouse book was not changed.`)
      setQuantity('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="SOP-007"
        title={title}
        description={kind === 'inward'
          ? 'Inward quantity cannot pass the lot still outside the chambers, or the free capacity of the chamber.'
          : 'Outward quantity cannot pass the stock still in the chosen chamber.'}
        actions={<Button type="button" variant="outline" asChild><Link to="/cold-storage">Cold storage desk</Link></Button>}
      />
      <ColdNotice />
      {writer && chamber && lot ? (
        <Card>
          <CardHeader><CardTitle>Record a simulated movement</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <SelectField label="Chamber" value={chamber.id} onValueChange={(value) => { setChamberId(value); setLotId('') }}>
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
      ) : <p className="text-sm text-muted-foreground">{writer ? 'No allocated chamber has stock for this movement.' : 'This role can read stock and cannot post a movement.'}</p>}
      {recent.map((move) => (
        <article key={move.id} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
          <p className="font-medium">{move.moveNo} · {move.chamberCode} · {move.lotNo}</p>
          <p className="mt-1">{formatUnits(move.quantityUnits)} q · {move.commodityName} · {move.partyLabel}</p>
          <p className="mt-1 text-muted-foreground">{move.note}</p>
        </article>
      ))}
    </div>
  )
}
