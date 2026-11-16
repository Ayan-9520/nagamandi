import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toDataURL } from 'qrcode'
import { toast } from 'sonner'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { SelectField } from '@/components/forms/SelectField'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SelectItem } from '@/components/ui/select'
import { ParkingBadge, ParkingNotice } from '@/features/parking/ParkingBits'
import { slotLabel } from '@/features/parking/meta'
import { activeVisit, canOperateParking, slotState } from '@/services/parking-rules'
import { useParkingStore } from '@/store/parking-store'
import { useRegistryStore } from '@/store/registry-store'
import { useSessionStore } from '@/store/session-store'

export function VehiclePage() {
  const parkingReady = useParkingStore((state) => state.ready)
  const registryReady = useRegistryStore((state) => state.ready)
  const ready = parkingReady && registryReady
  const vehicles = useParkingStore((state) => state.vehicles)
  const parties = useRegistryStore((state) => state.parties)
  const registerVehicle = useParkingStore((state) => state.registerVehicle)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const transporters = parties.filter((row) => row.kind === 'transporter' && row.status === 'Active')
  const [transporterId, setTransporterId] = useState('')
  const [plate, setPlate] = useState('')
  if (!ready) return <LoadingState label="Loading vehicles" />
  const transporter = transporters.find((row) => row.id === transporterId) ?? transporters[0]
  const writer = roleId ? canOperateParking(roleId) : false

  function submit() {
    if (!roleId || !accountId || !transporter) return
    const result = registerVehicle({ roleId, accountId }, { transporterId: transporter.id, plate, note: '' })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was registered. This is not a permit.`)
      setPlate('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-010" title="Vehicle registration" description="A plate is stored against a transporter desk code. Registration does not permit the vehicle to enter." actions={<Button type="button" variant="outline" asChild><Link to="/parking">Transport desk</Link></Button>} />
      <ParkingNotice />
      {writer && transporter ? (
        <Card>
          <CardHeader><CardTitle>Register a goods vehicle</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <SelectField label="Transporter" value={transporter.id} onValueChange={setTransporterId}>
              {transporters.map((row) => <SelectItem key={row.id} value={row.id}>{row.label}</SelectItem>)}
            </SelectField>
            <TextField label="Vehicle number" value={plate} onChange={(event) => setPlate(event.target.value)} hint="6 to 16 letters, digits or hyphens." />
            <Button type="button" onClick={submit}>Register vehicle</Button>
          </CardContent>
        </Card>
      ) : <p className="text-sm text-muted-foreground">This role can read the register and cannot add a vehicle.</p>}
      {vehicles.map((row) => (
        <p key={row.id} className="text-sm">{row.id} · {row.vehicleNo} · {row.transporterLabel}</p>
      ))}
    </div>
  )
}

export function EntryPage() {
  const ready = useParkingStore((state) => state.ready)
  const vehicles = useParkingStore((state) => state.vehicles)
  const visits = useParkingStore((state) => state.visits)
  const slots = useParkingStore((state) => state.slots)
  const enterVehicle = useParkingStore((state) => state.enterVehicle)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const choices = [...vehicles.filter((row) => !activeVisit(visits, row.id)), ...vehicles.filter((row) => activeVisit(visits, row.id)?.status === 'reserved')]
  const [vehicleId, setVehicleId] = useState('')
  const [slotId, setSlotId] = useState('')
  if (!ready) return <LoadingState label="Loading entry" />
  const vehicle = choices.find((row) => row.id === vehicleId) ?? choices[0]
  const reserved = vehicle ? activeVisit(visits, vehicle.id) : undefined
  const slot = reserved ? slots.find((row) => row.id === reserved.slotId) : slots.find((row) => row.id === slotId) ?? slots.find((row) => slotState(visits, row.id) === 'available') ?? slots[0]
  const writer = roleId ? canOperateParking(roleId) : false

  function submit() {
    if (!roleId || !accountId || !vehicle || !slot) return
    const result = enterVehicle({ roleId, accountId }, { vehicleId: vehicle.id, slotId: slot.id })
    if (!result.ok) toast.error(result.message)
    else toast.success(`${result.id} was written. Open the pass. It is not a gate pass.`)
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-010" title="Vehicle entry" description="Entry needs a registered vehicle and a slot that is not occupied or reserved for someone else. A reserved vehicle enters on its own slot." actions={<Button type="button" variant="outline" asChild><Link to="/parking">Transport desk</Link></Button>} />
      <ParkingNotice />
      {writer && vehicle && slot ? (
        <Card>
          <CardHeader><CardTitle>Record entry</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <SelectField label="Vehicle" value={vehicle.id} onValueChange={setVehicleId}>
              {choices.map((row) => <SelectItem key={row.id} value={row.id}>{row.vehicleNo} · {row.transporterLabel}</SelectItem>)}
            </SelectField>
            <SelectField label="Slot" value={slot.id} onValueChange={setSlotId}>
              {(reserved ? [slot] : slots).map((row) => <SelectItem key={row.id} value={row.id}>{row.code} · {slotLabel(slotState(visits, row.id))}</SelectItem>)}
            </SelectField>
            <Button type="button" onClick={submit}>Record entry</Button>
          </CardContent>
        </Card>
      ) : <p className="text-sm text-muted-foreground">{writer ? 'No registered vehicle is waiting.' : 'This role can read entries and cannot record one.'}</p>}
      {visits.filter((row) => row.passNo).map((row) => (
        <p key={row.id} className="text-sm">
          {row.passNo} · {row.vehicleNo} · {row.slotCode} · <Link className="underline" to={`/parking/passes/${row.passNo}`}>Open pass</Link>
        </p>
      ))}
    </div>
  )
}

export function ExitPage() {
  const ready = useParkingStore((state) => state.ready)
  const visits = useParkingStore((state) => state.visits)
  const exitVehicle = useParkingStore((state) => state.exitVehicle)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const inside = visits.filter((row) => row.status === 'inside')
  const [visitId, setVisitId] = useState('')
  const [hours, setHours] = useState('')
  if (!ready) return <LoadingState label="Loading exits" />
  const visit = inside.find((row) => row.id === visitId) ?? inside[0]
  const writer = roleId ? canOperateParking(roleId) : false

  function submit() {
    if (!roleId || !accountId || !visit) return
    const result = exitVehicle({ roleId, accountId }, { visitId: visit.id, hours })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${visit.vehicleNo} left ${visit.slotCode}. The fee was not collected.`)
      setHours('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-010" title="Vehicle exit" description="Exit closes an inside visit. Whole hours from 1 to 48 set a simulated fee of ₹20 an hour." actions={<Button type="button" variant="outline" asChild><Link to="/parking">Transport desk</Link></Button>} />
      <ParkingNotice />
      {writer && visit ? (
        <Card>
          <CardHeader><CardTitle>Record exit</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <SelectField label="Visit" value={visit.id} onValueChange={setVisitId}>
              {inside.map((row) => <SelectItem key={row.id} value={row.id}>{row.vehicleNo} · {row.slotCode}</SelectItem>)}
            </SelectField>
            <TextField label="Hours" value={hours} onChange={(event) => setHours(event.target.value)} hint="A whole number from 1 to 48." />
            <Button type="button" onClick={submit}>Record exit</Button>
          </CardContent>
        </Card>
      ) : <p className="text-sm text-muted-foreground">{writer ? 'No vehicle is inside.' : 'This role can read exits and cannot record one.'}</p>}
    </div>
  )
}

export function PassPage() {
  const { id = '' } = useParams()
  const ready = useParkingStore((state) => state.ready)
  const visit = useParkingStore((state) => state.visits.find((row) => row.passNo === id))
  if (!ready) return <LoadingState label="Loading the entry pass" />
  if (!visit) return <EmptyState title="Pass not in this browser" description="Record an entry before a demonstration pass can be opened." />
  const payload = `DEMO|NAGA-MANDI|${visit.passNo}|not-a-gate-pass`

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap gap-2">
        <Button type="button" variant="outline" asChild><Link to="/parking/entry">Back to entry</Link></Button>
        <Button type="button" onClick={() => window.print()}>Print preview</Button>
      </div>
      <article className="print-sheet mx-auto max-w-3xl space-y-5 rounded-xl border-2 border-primary bg-white p-8 text-slate-900">
        <header className="flex items-start justify-between gap-4 border-b border-primary/30 pb-4">
          <div>
            <p className="text-xs tracking-[0.2em] text-primary uppercase">Naga Mandi OS · SOP-010</p>
            <h1 className="font-display text-3xl text-primary">Vehicle entry pass</h1>
            <p className="text-sm">DEMO / SIMULATED. This is not a gate pass and no fee was collected.</p>
          </div>
          <ParkingBadge tone="warn">DEMO / SIMULATED</ParkingBadge>
        </header>
        <p className="font-display text-2xl">{visit.passNo}</p>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <Item label="Vehicle" value={visit.vehicleNo} />
          <Item label="Transporter" value={visit.transporterLabel} />
          <Item label="Yard" value={visit.yardCode} />
          <Item label="Slot" value={visit.slotCode} />
          <Item label="Visit" value={visit.visitNo} />
          <Item label="Status" value={visit.status} />
        </dl>
        <div className="flex items-end justify-between gap-4">
          <Mark payload={payload} />
          <p className="max-w-xs text-right text-xs text-slate-600">The mark only identifies this demonstration record.</p>
        </div>
      </article>
    </div>
  )
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}

function Mark({ payload }: { payload: string }) {
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    let current = true
    void toDataURL(payload, { margin: 1, width: 160, color: { dark: '#14532d', light: '#ffffff' } }).then((url) => {
      if (current) setSrc(url)
    })
    return () => {
      current = false
    }
  }, [payload])
  if (!src) return <p className="text-sm text-slate-500">Preparing the demonstration mark.</p>
  return <img src={src} alt="" width={160} height={160} className="rounded-md border bg-white p-2" />
}
