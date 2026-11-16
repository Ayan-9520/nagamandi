import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { SelectField } from '@/components/forms/SelectField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SelectItem } from '@/components/ui/select'
import { ParkingNotice, SlotGrid } from '@/features/parking/ParkingBits'
import { slotLabel, visitLabel } from '@/features/parking/meta'
import { formatPaise } from '@/services/money'
import { activeVisit, canOperateParking, slotState } from '@/services/parking-rules'
import { useParkingStore } from '@/store/parking-store'
import { useSessionStore } from '@/store/session-store'

export function AllocationPage() {
  const ready = useParkingStore((state) => state.ready)
  const vehicles = useParkingStore((state) => state.vehicles)
  const visits = useParkingStore((state) => state.visits)
  const slots = useParkingStore((state) => state.slots)
  const reserveSlot = useParkingStore((state) => state.reserveSlot)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const waiting = vehicles.filter((row) => !activeVisit(visits, row.id))
  const [vehicleId, setVehicleId] = useState('')
  const [slotId, setSlotId] = useState('')
  if (!ready) return <LoadingState label="Loading allocation" />
  const vehicle = waiting.find((row) => row.id === vehicleId) ?? waiting[0]
  const slot = slots.find((row) => row.id === slotId) ?? slots.find((row) => slotState(visits, row.id) === 'available') ?? slots[0]
  const writer = roleId ? canOperateParking(roleId) : false

  function submit() {
    if (!roleId || !accountId || !vehicle || !slot) return
    const result = reserveSlot({ roleId, accountId }, { vehicleId: vehicle.id, slotId: slot.id })
    if (!result.ok) toast.error(result.message)
    else toast.success(`${result.id} reserved ${slot.code}. The slot is not occupied.`)
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-010" title="Parking allocation" description="A reservation holds an available slot. An occupied slot cannot be given to another active visit." actions={<Button type="button" variant="outline" asChild><Link to="/parking">Transport desk</Link></Button>} />
      <ParkingNotice />
      {writer && vehicle && slot ? (
        <Card>
          <CardHeader><CardTitle>Reserve a slot</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <SelectField label="Vehicle" value={vehicle.id} onValueChange={setVehicleId}>
              {waiting.map((row) => <SelectItem key={row.id} value={row.id}>{row.vehicleNo} · {row.transporterLabel}</SelectItem>)}
            </SelectField>
            <SelectField label="Slot" value={slot.id} onValueChange={setSlotId}>
              {slots.map((row) => <SelectItem key={row.id} value={row.id}>{row.code} · {slotLabel(slotState(visits, row.id))}</SelectItem>)}
            </SelectField>
            <Button type="button" onClick={submit}>Reserve slot</Button>
          </CardContent>
        </Card>
      ) : <p className="text-sm text-muted-foreground">{writer ? 'Every registered vehicle already has an active visit.' : 'This role can read allocations and cannot reserve a slot.'}</p>}
    </div>
  )
}

export function OccupancyPage() {
  const ready = useParkingStore((state) => state.ready)
  const yards = useParkingStore((state) => state.yards)
  const slots = useParkingStore((state) => state.slots)
  const visits = useParkingStore((state) => state.visits)
  const [yardId, setYardId] = useState('')
  if (!ready) return <LoadingState label="Loading occupancy" />
  const yard = yards.find((row) => row.id === yardId) ?? yards[0]
  const yardSlots = yard ? slots.filter((row) => row.yardId === yard.id) : []
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-010" title="Parking occupancy" description="Available slots are open. Occupied slots have a vehicle inside. Reserved slots are held for one vehicle." actions={<Button type="button" variant="outline" asChild><Link to="/parking">Transport desk</Link></Button>} />
      <ParkingNotice />
      {yard ? (
        <SelectField label="Yard" value={yard.id} onValueChange={setYardId}>
          {yards.map((row) => <SelectItem key={row.id} value={row.id}>{row.code} · {row.name}</SelectItem>)}
        </SelectField>
      ) : null}
      <SlotGrid slots={yardSlots} visits={visits} />
    </div>
  )
}

export function FeePage() {
  const ready = useParkingStore((state) => state.ready)
  const visits = useParkingStore((state) => state.visits)
  if (!ready) return <LoadingState label="Loading fees" />
  const fees = visits.filter((row) => row.feePaise > 0)
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-010" title="Parking fee simulation" description="₹20 for each whole hour on an exited visit. The figure is not posted to the finance book and nothing is collected." actions={<Button type="button" variant="outline" asChild><Link to="/parking">Transport desk</Link></Button>} />
      <ParkingNotice />
      {fees.length === 0 ? <p className="text-sm">No simulated fee is on file.</p> : null}
      {fees.map((row) => (
        <p key={row.id} className="text-sm">{row.visitNo} · {row.vehicleNo} · {row.hours} h · {formatPaise(row.feePaise)} · DEMO / SIMULATED</p>
      ))}
    </div>
  )
}

export function MovementPage() {
  const ready = useParkingStore((state) => state.ready)
  const visits = useParkingStore((state) => state.visits)
  if (!ready) return <LoadingState label="Loading movements" />
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-010" title="Vehicle movement register" description="Each visit keeps the slot, the entry and the exit. A reservation is a hold, not an entry." actions={<Button type="button" variant="outline" asChild><Link to="/parking">Transport desk</Link></Button>} />
      <ParkingNotice />
      {visits.map((row) => (
        <article key={row.id} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
          <p className="font-medium">{row.visitNo} · {row.vehicleNo} · {row.yardCode} {row.slotCode}</p>
          <p className="mt-1">{visitLabel(row.status)}{row.passNo ? ` · ${row.passNo}` : ''}</p>
          <p className="mt-1 text-muted-foreground">{row.enteredAt ? `Entered ${row.enteredAt}` : 'Not entered'}{row.exitedAt ? ` · Exited ${row.exitedAt}` : ''}</p>
        </article>
      ))}
    </div>
  )
}
