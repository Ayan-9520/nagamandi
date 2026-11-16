import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { SelectField } from '@/components/forms/SelectField'
import { TextAreaField } from '@/components/forms/TextAreaField'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/ui/button'
import { SelectItem } from '@/components/ui/select'
import { ConnectionStatus, FieldNotice, readPhoto, useOnline } from '@/features/field/FieldBits'
import { QrCapture } from '@/features/field/QrCapture'
import { ParchiQr } from '@/features/trading/TradeBits'
import { formatRupee } from '@/features/trading/meta'
import { CHECK_ITEMS, FACILITY_TEMPLATES, issuedSite } from '@/services/facility-rules'
import { hasModule } from '@/services/field-rules'
import { slotState } from '@/services/parking-rules'
import { workingMandi } from '@/services/registry-rules'
import { useArrivalStore } from '@/store/arrival-store'
import { useFacilityStore } from '@/store/facility-store'
import { useFieldStore } from '@/store/field-store'
import { useParkingStore } from '@/store/parking-store'
import { useRegistryStore } from '@/store/registry-store'
import { useSessionStore } from '@/store/session-store'
import { useTradeStore } from '@/store/trade-store'
import type { CheckKind } from '@/types/facility'

function Shell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="space-y-4 pb-4">
      <PageHeader eyebrow="Field desk" title={title} description={description} actions={<Button type="button" variant="outline" className="w-full sm:w-auto" asChild><Link to="/field">Field home</Link></Button>} />
      <FieldNotice />
      <ConnectionStatus />
      {children}
    </div>
  )
}

export function FieldHomePage() {
  const roleId = useSessionStore((state) => state.roleId)
  const ready = useFieldStore((state) => state.ready)
  const drafts = useFieldStore((state) => state.drafts)
  const lots = useArrivalStore((state) => state.lots)
  const trades = useTradeStore((state) => state.trades)
  const syncDraft = useFieldStore((state) => state.syncDraft)
  const accountId = useSessionStore((state) => state.accountId)
  const online = useOnline()
  const [found, setFound] = useState('')
  if (!ready || !roleId) return <LoadingState label="Loading the field desk" />
  const links = [
    hasModule(roleId, 'arrivals') ? { to: '/field/arrival', label: 'Arrival entry' } : null,
    hasModule(roleId, 'arrivals') ? { to: '/field/inspection', label: 'Lot inspection' } : null,
    hasModule(roleId, 'trading') ? { to: '/field/parchi', label: 'Parchi preview' } : null,
    hasModule(roleId, 'parking') ? { to: '/field/parking', label: 'Parking entry and exit' } : null,
    hasModule(roleId, 'facilities') ? { to: '/field/facilities', label: 'Facility inspections' } : null,
  ].filter((item) => item !== null)

  function lookup(code: string) {
    const lot = lots.find((row) => row.qrPayload === code || row.lotNo === code)
    const trade = trades.find((row) => row.qrPayload === code || row.sellerParchiNo === code || row.buyerParchiNo === code)
    if (lot) setFound(`${lot.lotNo} · ${lot.commodityName} · ${lot.status}`)
    else if (trade) setFound(`${trade.tradeNo} · ${trade.commodityName} · ${trade.status}`)
    else setFound('That demonstration code is not in this browser.')
  }

  return (
    <Shell title="Mobile field desk" description="Installable demonstration desk. Drafts stay on this device until the browser is online.">
      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((item) => (
          <Link key={item.to} to={item.to} className="rounded-xl bg-card px-4 py-4 text-sm font-medium ring-1 ring-foreground/10">
            {item.label}
          </Link>
        ))}
      </div>
      <section className="space-y-3 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
        <h2 className="text-sm font-medium">QR code</h2>
        <QrCapture onCode={lookup} />
        {found ? <p className="text-sm">{found}</p> : null}
      </section>
      <section className="space-y-2">
        <h2 className="text-sm font-medium">Draft synchronization</h2>
        {drafts.length === 0 ? <p className="text-sm">No draft is stored on this device.</p> : null}
        {drafts.map((row) => (
          <article key={row.id} className="flex flex-col gap-2 rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10 sm:flex-row sm:items-center sm:justify-between">
            <p>{row.id} · {row.title} · {row.status}{row.conflict ? ` · ${row.conflict}` : ''}</p>
            {row.status !== 'synced' ? <Button type="button" size="sm" className="w-full sm:w-auto" onClick={() => {
              if (!accountId) return
              const result = syncDraft({ roleId, accountId }, row.id, online)
              if (!result.ok) toast.error(result.message)
              else toast.success(`${result.id} was written to the book. No payment was taken.`)
            }}>Sync draft</Button> : null}
          </article>
        ))}
      </section>
    </Shell>
  )
}

export function ArrivalFieldPage() {
  const roleId = useSessionStore((state) => state.roleId)
  const registryReady = useRegistryStore((state) => state.ready)
  const parties = useRegistryStore((state) => state.parties)
  const commodities = useRegistryStore((state) => state.commodities)
  const grades = useRegistryStore((state) => state.grades)
  const units = useRegistryStore((state) => state.units)
  const locations = useRegistryStore((state) => state.locations)
  const saveDraft = useFieldStore((state) => state.saveDraft)
  const [sellerId, setSellerId] = useState('')
  const [agentId, setAgentId] = useState('')
  const [commodityId, setCommodityId] = useState('')
  const [gradeId, setGradeId] = useState('')
  const [unitId, setUnitId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [gross, setGross] = useState('1.2')
  const [tare, setTare] = useState('0.2')
  const [vehicleNo, setVehicleNo] = useState('')
  const [note, setNote] = useState('')
  const [photoName, setPhotoName] = useState('')
  const [photoDataUrl, setPhotoDataUrl] = useState('')
  if (!registryReady || !roleId) return <LoadingState label="Loading arrival entry" />
  if (!hasModule(roleId, 'arrivals')) return <Shell title="Arrival entry" description="This role does not file gate lots.">{null}</Shell>
  const mandi = workingMandi(locations)
  const sellers = parties.filter((row) => row.kind === 'farmer' && row.status === 'Active' && row.mandiId === mandi?.id)
  const agents = parties.filter((row) => row.kind === 'aadathiya' && row.status === 'Active' && row.mandiId === mandi?.id)
  const goods = commodities.filter((row) => row.status === 'Active' && row.mandiId === mandi?.id)
  const seller = sellers.find((row) => row.id === sellerId) ?? sellers[0]
  const agent = agents.find((row) => row.id === agentId) ?? agents[0]
  const graded = goods.filter((row) => grades.some((grade) => grade.status === 'Active' && grade.commodityId === row.id))
  const commodity = graded.find((row) => row.id === commodityId) ?? graded[0]
  const gradeChoices = grades.filter((row) => row.status === 'Active' && row.commodityId === commodity?.id)
  const grade = gradeChoices.find((row) => row.id === gradeId) ?? gradeChoices[0]
  const measures = units.filter((row) => row.status === 'Active' && row.mandiId === mandi?.id)
  const unit = measures.find((row) => row.id === unitId) ?? measures[0]

  function save() {
    if (!seller || !agent || !commodity || !grade || !unit) return
    const result = saveDraft({
      kind: 'arrival',
      title: vehicleNo.trim() || 'Arrival draft',
      baseToken: 'new',
      targetId: '',
      photoName,
      photoDataUrl,
      fields: {
        sellerId: seller.id,
        aadathiyaId: agent.id,
        commodityId: commodity.id,
        gradeId: grade.id,
        unitId: unit.id,
        quantity,
        gross,
        tare,
        bay: 'WB-01',
        crateCount: '0',
        crateCode: '',
        vehicleNo,
        note,
      },
    })
    if (!result.ok) toast.error(result.message)
    else toast.success(`${result.id} was saved on this device. The lot was not registered.`)
  }

  return (
    <Shell title="Arrival entry" description="A photo can be attached. Saving here keeps a draft. The gate lot is registered only when the draft is synced online.">
      {seller && agent && commodity && grade && unit ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField label="Seller" value={seller.id} onValueChange={setSellerId}>{sellers.map((row) => <SelectItem key={row.id} value={row.id}>{row.label}</SelectItem>)}</SelectField>
          <SelectField label="Aadathiya" value={agent.id} onValueChange={setAgentId}>{agents.map((row) => <SelectItem key={row.id} value={row.id}>{row.label}</SelectItem>)}</SelectField>
          <SelectField label="Commodity" value={commodity.id} onValueChange={setCommodityId}>{graded.map((row) => <SelectItem key={row.id} value={row.id}>{row.name}</SelectItem>)}</SelectField>
          <SelectField label="Grade" value={grade.id} onValueChange={setGradeId}>{gradeChoices.map((row) => <SelectItem key={row.id} value={row.id}>{row.name}</SelectItem>)}</SelectField>
          <SelectField label="Unit" value={unit.id} onValueChange={setUnitId}>{measures.map((row) => <SelectItem key={row.id} value={row.id}>{row.symbol}</SelectItem>)}</SelectField>
          <TextField label="Quantity" value={quantity} onChange={(event) => setQuantity(event.target.value)} hint="Must equal gross minus tare." />
          <TextField label="Gross" value={gross} onChange={(event) => setGross(event.target.value)} />
          <TextField label="Tare" value={tare} onChange={(event) => setTare(event.target.value)} />
          <TextField label="Vehicle" value={vehicleNo} onChange={(event) => setVehicleNo(event.target.value)} hint="NL07-DEMO-880" />
          <TextAreaField label="Note" value={note} onChange={(event) => setNote(event.target.value)} />
          <label className="text-sm">Photo
            <input className="mt-1 block w-full text-sm" type="file" accept="image/*" capture="environment" onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) return
              readPhoto(file).then((photo) => { setPhotoName(photo.name); setPhotoDataUrl(photo.dataUrl) }).catch((error: Error) => toast.error(error.message))
            }} />
          </label>
          {photoDataUrl ? <img src={photoDataUrl} alt="Arrival draft" className="max-h-40 w-full rounded-lg object-cover" /> : null}
          <Button type="button" className="w-full sm:w-auto" onClick={save}>Save arrival draft</Button>
        </div>
      ) : <p className="text-sm">The working mandi needs an active seller, aadathiya, commodity and unit.</p>}
    </Shell>
  )
}

export function InspectionFieldPage() {
  const roleId = useSessionStore((state) => state.roleId)
  const lots = useArrivalStore((state) => state.lots)
  const ready = useArrivalStore((state) => state.ready)
  const saveDraft = useFieldStore((state) => state.saveDraft)
  const [lotId, setLotId] = useState('')
  const [note, setNote] = useState('')
  const [photoName, setPhotoName] = useState('')
  const [photoDataUrl, setPhotoDataUrl] = useState('')
  if (!ready || !roleId) return <LoadingState label="Loading lot inspection" />
  if (!hasModule(roleId, 'arrivals')) return <Shell title="Lot inspection" description="This role does not inspect lots.">{null}</Shell>
  const lot = lots.find((row) => row.id === lotId) ?? lots[0]

  function save() {
    if (!lot) return
    if (note.trim().length < 8) {
      toast.error('Describe the inspection in at least 8 characters.')
      return
    }
    const result = saveDraft({
      kind: 'lot-inspection',
      title: lot.lotNo,
      baseToken: lot.updatedAt,
      targetId: lot.id,
      photoName,
      photoDataUrl,
      fields: { note },
    })
    if (!result.ok) toast.error(result.message)
    else toast.success(`${result.id} was saved on this device. The lot status was not changed.`)
  }

  return (
    <Shell title="Lot inspection" description="The draft remembers the lot as it was. If that lot changes before sync, the draft is not applied.">
      {lot ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField label="Lot" value={lot.id} onValueChange={setLotId}>{lots.map((row) => <SelectItem key={row.id} value={row.id}>{row.lotNo} · {row.status}</SelectItem>)}</SelectField>
          <TextAreaField label="Note" value={note} onChange={(event) => setNote(event.target.value)} hint="At least 8 characters." />
          <label className="text-sm">Photo
            <input className="mt-1 block w-full text-sm" type="file" accept="image/*" capture="environment" onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) return
              readPhoto(file).then((photo) => { setPhotoName(photo.name); setPhotoDataUrl(photo.dataUrl) }).catch((error: Error) => toast.error(error.message))
            }} />
          </label>
          <Button type="button" className="w-full sm:w-auto" onClick={save}>Save inspection draft</Button>
        </div>
      ) : <p className="text-sm">No lot is in this browser.</p>}
    </Shell>
  )
}

export function ParchiFieldPage() {
  const roleId = useSessionStore((state) => state.roleId)
  const ready = useTradeStore((state) => state.ready)
  const trades = useTradeStore((state) => state.trades)
  if (!ready || !roleId) return <LoadingState label="Loading parchis" />
  if (!hasModule(roleId, 'trading')) return <Shell title="Parchi preview" description="This role does not open parchis.">{null}</Shell>
  const rows = trades.filter((row) => row.status === 'documented')
  return (
    <Shell title="Parchi preview" description="A parchi is a demonstration slip. This screen does not collect a payment.">
      {rows.length === 0 ? <p className="text-sm">No documented parchi is in this browser.</p> : null}
      {rows.map((row) => (
        <article key={row.id} className="space-y-2 rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
          <p className="font-medium">{row.tradeNo} · {row.commodityName}</p>
          <p>Seller {row.sellerParchiNo} · Buyer {row.buyerParchiNo} · {formatRupee(row.figures.saleValue)}</p>
          <ParchiQr payload={`DEMO|NAGA-MANDI|${row.sellerParchiNo}|not-a-receipt`} />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" className="w-full sm:w-auto" asChild><Link to={`/trading/${row.id}/seller-parchi`}>Seller preview</Link></Button>
            <Button type="button" variant="outline" className="w-full sm:w-auto" asChild><Link to={`/trading/${row.id}/buyer-parchi`}>Buyer preview</Link></Button>
          </div>
        </article>
      ))}
    </Shell>
  )
}

export function ParkingFieldPage() {
  const roleId = useSessionStore((state) => state.roleId)
  const ready = useParkingStore((state) => state.ready)
  const vehicles = useParkingStore((state) => state.vehicles)
  const slots = useParkingStore((state) => state.slots)
  const visits = useParkingStore((state) => state.visits)
  const saveDraft = useFieldStore((state) => state.saveDraft)
  const [vehicleId, setVehicleId] = useState('')
  const [slotId, setSlotId] = useState('')
  const [visitId, setVisitId] = useState('')
  const [hours, setHours] = useState('1')
  if (!ready || !roleId) return <LoadingState label="Loading parking" />
  if (!hasModule(roleId, 'parking')) return <Shell title="Parking entry and exit" description="This role does not record yard visits.">{null}</Shell>
  const openSlots = slots.filter((row) => slotState(visits, row.id) === 'available')
  const inside = visits.filter((row) => row.status === 'inside')
  const vehicle = vehicles.find((row) => row.id === vehicleId) ?? vehicles[0]
  const slot = openSlots.find((row) => row.id === slotId) ?? openSlots[0]
  const visit = inside.find((row) => row.id === visitId) ?? inside[0]

  return (
    <Shell title="Parking entry and exit" description="Entry and exit stay as drafts until sync. A simulated fee is not written, and it is not collected, while this browser is offline.">
      <div className="grid gap-4 md:grid-cols-2">
        {vehicle && slot ? (
          <>
            <SelectField label="Vehicle" value={vehicle.id} onValueChange={setVehicleId}>{vehicles.map((row) => <SelectItem key={row.id} value={row.id}>{row.vehicleNo}</SelectItem>)}</SelectField>
            <SelectField label="Open slot" value={slot.id} onValueChange={setSlotId}>{openSlots.map((row) => <SelectItem key={row.id} value={row.id}>{row.code}</SelectItem>)}</SelectField>
            <Button type="button" className="w-full sm:w-auto" onClick={() => {
              const result = saveDraft({ kind: 'parking-entry', title: `${vehicle.vehicleNo} · ${slot.code}`, baseToken: 'available', targetId: '', photoName: '', photoDataUrl: '', fields: { vehicleId: vehicle.id, slotId: slot.id } })
              if (!result.ok) toast.error(result.message)
              else toast.success(`${result.id} was saved on this device. The vehicle was not entered.`)
            }}>Save entry draft</Button>
          </>
        ) : <p className="text-sm">No open slot is available for a new entry draft.</p>}
        {visit ? (
          <>
            <SelectField label="Vehicle inside" value={visit.id} onValueChange={setVisitId}>{inside.map((row) => <SelectItem key={row.id} value={row.id}>{row.vehicleNo} · {row.slotCode}</SelectItem>)}</SelectField>
            <TextField label="Hours" value={hours} onChange={(event) => setHours(event.target.value)} hint="Whole hours from 1 to 48. Not a collection." />
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => {
              const result = saveDraft({ kind: 'parking-exit', title: visit.visitNo, baseToken: visit.status, targetId: visit.id, photoName: '', photoDataUrl: '', fields: { hours } })
              if (!result.ok) toast.error(result.message)
              else toast.success(`${result.id} was saved on this device. The visit was not closed.`)
            }}>Save exit draft</Button>
          </>
        ) : <p className="text-sm">No vehicle is inside.</p>}
      </div>
    </Shell>
  )
}

export function FacilityFieldPage() {
  const roleId = useSessionStore((state) => state.roleId)
  const ready = useFacilityStore((state) => state.ready)
  const sites = useFacilityStore((state) => state.sites)
  const leases = useFacilityStore((state) => state.leases)
  const saveDraft = useFieldStore((state) => state.saveDraft)
  const [siteId, setSiteId] = useState('')
  const [check, setCheck] = useState<CheckKind>('cleaning')
  const [note, setNote] = useState('')
  if (!ready || !roleId) return <LoadingState label="Loading facility inspections" />
  if (!hasModule(roleId, 'facilities')) return <Shell title="Facility inspections" description="This role does not file facility checklists.">{null}</Shell>
  const choices = sites.filter((site) => issuedSite(leases, site.id))
  const site = choices.find((row) => row.id === siteId) ?? choices[0]
  const checks = site ? FACILITY_TEMPLATES[site.kind].checks : []
  const kind = checks.includes(check) ? check : checks[0]

  function save() {
    if (!site || !kind) return
    const lease = leases.find((row) => row.siteId === site.id && row.status === 'issued')
    const fields: Record<string, string> = { siteId: site.id, check: kind, note }
    for (const item of CHECK_ITEMS[kind]) fields[item.id] = 'yes'
    const result = saveDraft({
      kind: 'facility-inspection',
      title: `${site.code} · ${kind}`,
      baseToken: lease?.updatedAt ?? '',
      targetId: lease?.id ?? '',
      photoName: '',
      photoDataUrl: '',
      fields,
    })
    if (!result.ok) toast.error(result.message)
    else toast.success(`${result.id} was saved on this device. The checklist was not filed.`)
  }

  return (
    <Shell title="Facility inspections" description="Cleaning, fire, hygiene and operations follow the facility template. The checklist is filed only when the draft is synced online.">
      {site && kind ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField label="Site" value={site.id} onValueChange={setSiteId}>{choices.map((row) => <SelectItem key={row.id} value={row.id}>{row.code} · {FACILITY_TEMPLATES[row.kind].title}</SelectItem>)}</SelectField>
          <SelectField label="Checklist" value={kind} onValueChange={(value) => setCheck(value as CheckKind)}>{checks.map((row) => <SelectItem key={row} value={row}>{row}</SelectItem>)}</SelectField>
          <TextAreaField label="Note" value={note} onChange={(event) => setNote(event.target.value)} hint="Optional when every line is yes." />
          <p className="text-sm">{CHECK_ITEMS[kind].map((item) => item.label).join(' · ')} · marked yes on the draft</p>
          <Button type="button" className="w-full sm:w-auto" onClick={save}>Save inspection draft</Button>
        </div>
      ) : <p className="text-sm">No issued site is ready for a checklist.</p>}
    </Shell>
  )
}
