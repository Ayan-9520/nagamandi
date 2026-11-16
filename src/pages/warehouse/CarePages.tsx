import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { SelectField } from '@/components/forms/SelectField'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/ui/button'
import { SelectItem } from '@/components/ui/select'
import { ShedBadge, WarehouseNotice } from '@/features/warehouse/WarehouseBits'
import { canOperateWarehouse } from '@/services/warehouse-rules'
import { useSessionStore } from '@/store/session-store'
import { useWarehouseStore } from '@/store/warehouse-store'

export function InsurancePage() {
  const ready = useWarehouseStore((state) => state.ready)
  const sheds = useWarehouseStore((state) => state.sheds)
  const insurance = useWarehouseStore((state) => state.insurance)
  const fileInsurance = useWarehouseStore((state) => state.fileInsurance)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const [shedId, setShedId] = useState('')
  const [cover, setCover] = useState('')
  const [until, setUntil] = useState('2027-03-31')
  if (!ready) return <LoadingState label="Loading insurance notes" />
  const shed = sheds.find((row) => row.id === shedId) ?? sheds[0]
  const writer = roleId ? canOperateWarehouse(roleId) : false

  function submit() {
    if (!roleId || !accountId || !shed) return
    const result = fileInsurance({ roleId, accountId }, { shedId: shed.id, cover, until })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was noted. No policy was purchased.`)
      setCover('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-005" title="Insurance record" description="Cover notes are simulated. They do not name an insurer and they do not pay a claim." actions={<Button type="button" variant="outline" asChild><Link to="/warehouses">Warehouse desk</Link></Button>} />
      <WarehouseNotice />
      {insurance.map((row) => (
        <article key={row.id} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
          <p className="font-medium">{row.policyNo} · {row.shedCode}</p>
          <p className="mt-1">{row.cover}</p>
          <p className="mt-1 text-muted-foreground">Until {row.until} · {row.note}</p>
        </article>
      ))}
      {writer && shed ? (
        <div className="grid gap-3 md:grid-cols-2">
          <SelectField label="Shed" value={shed.id} onValueChange={setShedId}>
            {sheds.map((row) => <SelectItem key={row.id} value={row.id}>{row.code}</SelectItem>)}
          </SelectField>
          <TextField label="Cover until" value={until} onChange={(event) => setUntil(event.target.value)} hint="YYYY-MM-DD" />
          <TextField label="Simulated cover" value={cover} onChange={(event) => setCover(event.target.value)} hint="At least 8 characters." />
          <div className="flex items-end"><Button type="button" onClick={submit}>Add cover note</Button></div>
        </div>
      ) : null}
    </div>
  )
}

export function MaintenancePage() {
  const ready = useWarehouseStore((state) => state.ready)
  const sheds = useWarehouseStore((state) => state.sheds)
  const maintenance = useWarehouseStore((state) => state.maintenance)
  const fileMaintenance = useWarehouseStore((state) => state.fileMaintenance)
  const closeMaintenance = useWarehouseStore((state) => state.closeMaintenance)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const [shedId, setShedId] = useState('')
  const [title, setTitle] = useState('')
  if (!ready) return <LoadingState label="Loading the maintenance log" />
  const shed = sheds.find((row) => row.id === shedId) ?? sheds[0]
  const writer = roleId ? canOperateWarehouse(roleId) : false

  function submit() {
    if (!roleId || !accountId || !shed) return
    const result = fileMaintenance({ roleId, accountId }, { shedId: shed.id, title, note: '' })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was logged. No work order was sent.`)
      setTitle('')
    }
  }

  function close(id: string) {
    if (!roleId || !accountId) return
    const result = closeMaintenance({ roleId, accountId }, id)
    if (!result.ok) toast.error(result.message)
    else toast.success('The log was closed in this browser.')
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-005" title="Maintenance log" description="Open notes stay until they are closed. Closing a log does not call a contractor." actions={<Button type="button" variant="outline" asChild><Link to="/warehouses">Warehouse desk</Link></Button>} />
      <WarehouseNotice />
      {maintenance.map((row) => (
        <article key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
          <div>
            <p className="font-medium">{row.id} · {row.shedCode} · {row.title}</p>
            <p className="mt-1 text-muted-foreground">{row.note}</p>
          </div>
          {row.status === 'open' && writer ? <Button type="button" size="sm" variant="outline" onClick={() => close(row.id)}>Close log</Button> : <ShedBadge tone={row.status === 'closed' ? 'ok' : 'warn'}>{row.status === 'open' ? 'Open' : 'Closed'}</ShedBadge>}
        </article>
      ))}
      {writer && shed ? (
        <div className="grid gap-3 md:grid-cols-2">
          <SelectField label="Shed" value={shed.id} onValueChange={setShedId}>
            {sheds.map((row) => <SelectItem key={row.id} value={row.id}>{row.code}</SelectItem>)}
          </SelectField>
          <TextField label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
          <Button type="button" onClick={submit}>Add log</Button>
        </div>
      ) : null}
    </div>
  )
}
