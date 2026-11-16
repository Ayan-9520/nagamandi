import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { SelectField } from '@/components/forms/SelectField'
import { TextAreaField } from '@/components/forms/TextAreaField'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SelectItem } from '@/components/ui/select'
import { WarehouseNotice } from '@/features/warehouse/WarehouseBits'
import { canOperateWarehouse, liveContract } from '@/services/warehouse-rules'
import { useRegistryStore } from '@/store/registry-store'
import { useSessionStore } from '@/store/session-store'
import { useWarehouseStore } from '@/store/warehouse-store'

export function ContractApplyPage() {
  const warehouseReady = useWarehouseStore((state) => state.ready)
  const registryReady = useRegistryStore((state) => state.ready)
  const ready = warehouseReady && registryReady
  const sheds = useWarehouseStore((state) => state.sheds)
  const contracts = useWarehouseStore((state) => state.contracts)
  const parties = useRegistryStore((state) => state.parties)
  const fileContract = useWarehouseStore((state) => state.fileContract)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const openSheds = sheds.filter((shed) => !liveContract(contracts, shed.id))
  const operators = parties.filter((row) => row.kind === 'warehouse-operator' && row.status === 'Active')
  const [shedId, setShedId] = useState('')
  const [operatorId, setOperatorId] = useState('')
  const [experience, setExperience] = useState('')
  const [start, setStart] = useState('2026-11-16')
  const [end, setEnd] = useState('2027-11-15')
  if (!ready) return <LoadingState label="Loading the application form" />
  const shed = openSheds.find((row) => row.id === shedId) ?? openSheds[0]
  const operator = operators.find((row) => row.id === operatorId) ?? operators[0]
  const writer = roleId ? canOperateWarehouse(roleId) : false

  function submit() {
    if (!roleId || !accountId || !shed || !operator) return
    const result = fileContract({ roleId, accountId }, { operatorId: operator.id, shedId: shed.id, experience, start, end })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was filed. No application fee was taken.`)
      setExperience('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-004" title="Contract application" description="Apply for an unallocated shed. The application is a simulation and does not collect a fee." actions={<Button type="button" variant="outline" asChild><Link to="/warehouses">Warehouse desk</Link></Button>} />
      <WarehouseNotice />
      {writer && shed && operator ? (
        <Card>
          <CardHeader><CardTitle>Warehouse operations application</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <SelectField label="Shed" value={shed.id} onValueChange={setShedId}>
              {openSheds.map((row) => <SelectItem key={row.id} value={row.id}>{row.code} · {row.name}</SelectItem>)}
            </SelectField>
            <SelectField label="Operator desk code" value={operator.id} onValueChange={setOperatorId}>
              {operators.map((row) => <SelectItem key={row.id} value={row.id}>{row.label}</SelectItem>)}
            </SelectField>
            <TextField label="Start" value={start} onChange={(event) => setStart(event.target.value)} hint="YYYY-MM-DD" />
            <TextField label="End" value={end} onChange={(event) => setEnd(event.target.value)} hint="Must fall after the start" />
            <div className="md:col-span-2">
              <TextAreaField label="Proposed operations" value={experience} onChange={(event) => setExperience(event.target.value)} hint="At least 8 characters. This is not a business record." />
            </div>
            <Button type="button" onClick={submit}>File application</Button>
          </CardContent>
        </Card>
      ) : <p className="text-sm text-muted-foreground">{writer ? 'Every sample shed already has a contract.' : 'This role can read the desk and cannot file an application.'}</p>}
    </div>
  )
}
