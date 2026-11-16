import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { SelectField } from '@/components/forms/SelectField'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/ui/button'
import { SelectItem } from '@/components/ui/select'
import { ChamberBadge, ColdNotice } from '@/features/cold-storage/ColdBits'
import { TemperatureChart } from '@/features/cold-storage/TemperatureChart'
import { canOperateCold, formatTenths, latestReading, outsideBand } from '@/services/cold-rules'
import { useColdStore } from '@/store/cold-store'
import { useSessionStore } from '@/store/session-store'

export function TemperatureDashboardPage() {
  const ready = useColdStore((state) => state.ready)
  const chambers = useColdStore((state) => state.chambers)
  const readings = useColdStore((state) => state.readings)
  if (!ready) return <LoadingState label="Loading temperature readings" />
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-007" title="Temperature monitoring" description="Each figure comes from the sample script or a manual entry in this browser. This desk is not connected to a probe, a logger, or any IoT device." actions={<Button type="button" variant="outline" asChild><Link to="/cold-storage">Cold storage desk</Link></Button>} />
      <ColdNotice />
      {chambers.map((chamber) => {
        const latest = latestReading(readings, chamber.id)
        const warn = latest ? outsideBand(chamber, latest.tenths) : false
        return (
          <article key={chamber.id} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{chamber.code} · band {formatTenths(chamber.minTenths)} to {formatTenths(chamber.maxTenths)}</p>
              <ChamberBadge tone={warn ? 'warn' : latest ? 'ok' : 'muted'}>{warn ? 'Outside demo band' : latest ? 'Inside demo band' : 'No reading yet'}</ChamberBadge>
            </div>
            <p className="mt-1">{latest ? `${formatTenths(latest.tenths)} · ${latest.source === 'manual' ? 'Manual entry' : 'Sample script'}` : 'No simulated reading is stored for this chamber.'}</p>
            {warn ? <p className="mt-1 text-gold-foreground">Warning: the latest reading is outside the configured demo threshold.</p> : null}
          </article>
        )
      })}
    </div>
  )
}

export function TemperatureEntryPage() {
  const ready = useColdStore((state) => state.ready)
  const chambers = useColdStore((state) => state.chambers)
  const readings = useColdStore((state) => state.readings)
  const fileReading = useColdStore((state) => state.fileReading)
  const addSampleReading = useColdStore((state) => state.addSampleReading)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const [chamberId, setChamberId] = useState('')
  const [temperature, setTemperature] = useState('')
  if (!ready) return <LoadingState label="Loading the temperature form" />
  const chamber = chambers.find((row) => row.id === chamberId) ?? chambers[0]
  const writer = roleId ? canOperateCold(roleId) : false

  function saveManual() {
    if (!roleId || !accountId || !chamber) return
    const result = fileReading({ roleId, accountId }, { chamberId: chamber.id, temperature, note: '' })
    if (!result.ok) {
      toast.error(result.message)
      return
    }
    const latest = useColdStore.getState().readings.find((row) => row.id === result.id)
    if (latest && outsideBand(chamber, latest.tenths)) toast.warning(`${result.id} was saved. Warning: it is outside the demo band for ${chamber.code}.`)
    else toast.success(`${result.id} was saved inside the demo band. No probe was read.`)
    setTemperature('')
  }

  function saveSample() {
    if (!roleId || !accountId || !chamber) return
    const result = addSampleReading({ roleId, accountId }, chamber.id)
    if (!result.ok) toast.error(result.message)
    else toast.success(`${result.id} was taken from the sample script. No probe was read.`)
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-007" title="Manual temperature entry" description="Type a chamber temperature. A value outside the demo band is saved and marked as a warning. Nothing is read from equipment." actions={<Button type="button" variant="outline" asChild><Link to="/cold-storage/temperature">Monitoring</Link></Button>} />
      <ColdNotice />
      {writer && chamber ? (
        <div className="grid gap-3 md:grid-cols-2">
          <SelectField label="Chamber" value={chamber.id} onValueChange={setChamberId}>
            {chambers.map((row) => <SelectItem key={row.id} value={row.id}>{row.code} · {formatTenths(row.minTenths)} to {formatTenths(row.maxTenths)}</SelectItem>)}
          </SelectField>
          <TextField label="Temperature °C" value={temperature} onChange={(event) => setTemperature(event.target.value)} hint="One decimal place at most. Example 4.2" />
          <div className="flex flex-wrap items-end gap-2">
            <Button type="button" onClick={saveManual}>Record manual reading</Button>
            <Button type="button" variant="outline" onClick={saveSample}>Add the next sample reading</Button>
          </div>
        </div>
      ) : <p className="text-sm text-muted-foreground">This role can read temperatures and cannot post a reading.</p>}
      {readings.slice(0, 6).map((row) => (
        <p key={row.id} className="text-sm">{row.id} · {row.chamberCode} · {formatTenths(row.tenths)} · {row.source === 'manual' ? 'Manual entry' : 'Sample script'}</p>
      ))}
    </div>
  )
}

export function TemperatureHistoryPage() {
  const ready = useColdStore((state) => state.ready)
  const chambers = useColdStore((state) => state.chambers)
  const readings = useColdStore((state) => state.readings)
  const [chamberId, setChamberId] = useState('')
  if (!ready) return <LoadingState label="Loading the temperature chart" />
  const chamber = chambers.find((row) => row.id === chamberId) ?? chambers[0]
  if (!chamber) return null
  const rows = readings.filter((row) => row.chamberId === chamber.id)
  const breaches = rows.filter((row) => outsideBand(chamber, row.tenths))
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-007" title="Temperature history" description="Dashed lines are the configured demo thresholds. Points above or below them are warnings from the sample, not from a sensor." actions={<Button type="button" variant="outline" asChild><Link to="/cold-storage/temperature">Monitoring</Link></Button>} />
      <ColdNotice />
      <SelectField label="Chamber" value={chamber.id} onValueChange={setChamberId}>
        {chambers.map((row) => <SelectItem key={row.id} value={row.id}>{row.code}</SelectItem>)}
      </SelectField>
      <TemperatureChart chamber={chamber} readings={rows} />
      {breaches.map((row) => (
        <p key={row.id} className="text-sm text-gold-foreground">Warning · {row.id} · {formatTenths(row.tenths)} is outside {formatTenths(chamber.minTenths)} to {formatTenths(chamber.maxTenths)}.</p>
      ))}
    </div>
  )
}
