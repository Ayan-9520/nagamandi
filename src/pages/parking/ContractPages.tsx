import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArticleList } from '@/components/common/ArticleList'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { SelectField } from '@/components/forms/SelectField'
import { TextAreaField } from '@/components/forms/TextAreaField'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SelectItem } from '@/components/ui/select'
import { ParkingBadge, ParkingNotice } from '@/features/parking/ParkingBits'
import { agreementLabel } from '@/features/parking/meta'
import { formatPaise } from '@/services/money'
import { canDecideParking, canOperateParking, liveYard, NEXT_AGREEMENT } from '@/services/parking-rules'
import { useParkingStore } from '@/store/parking-store'
import { useRegistryStore } from '@/store/registry-store'
import { useSessionStore } from '@/store/session-store'
import type { AgreementStatus } from '@/types/parking'

const officialMoves: AgreementStatus[] = ['under-verification', 'verified', 'clarification-required', 'approved', 'issued', 'rejected']

export function ContractApplyPage() {
  const parkingReady = useParkingStore((state) => state.ready)
  const registryReady = useRegistryStore((state) => state.ready)
  const ready = parkingReady && registryReady
  const yards = useParkingStore((state) => state.yards)
  const contracts = useParkingStore((state) => state.contracts)
  const parties = useRegistryStore((state) => state.parties)
  const fileParkingContract = useParkingStore((state) => state.fileParkingContract)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const openYards = yards.filter((yard) => !liveYard(contracts, yard.id))
  const operators = parties.filter((row) => row.kind === 'transporter' && row.status === 'Active')
  const [yardId, setYardId] = useState('')
  const [operatorId, setOperatorId] = useState('')
  const [experience, setExperience] = useState('')
  const [start, setStart] = useState('2026-11-16')
  const [end, setEnd] = useState('2027-11-15')
  if (!ready) return <LoadingState label="Loading the application form" />
  const yard = openYards.find((row) => row.id === yardId) ?? openYards[0]
  const operator = operators.find((row) => row.id === operatorId) ?? operators[0]
  const writer = roleId ? canOperateParking(roleId) : false

  function submit() {
    if (!roleId || !accountId || !yard || !operator) return
    const result = fileParkingContract({ roleId, accountId }, { operatorId: operator.id, yardId: yard.id, experience, start, end })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success(`${result.id} was filed. No application fee was taken.`)
      setExperience('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-009" title="Parking contract application" description="Apply for a yard that has no open contract. The application is a simulation and does not collect a fee." actions={<Button type="button" variant="outline" asChild><Link to="/parking">Transport desk</Link></Button>} />
      <ParkingNotice />
      {writer && yard && operator ? (
        <Card>
          <CardHeader><CardTitle>Goods vehicle parking application</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <SelectField label="Yard" value={yard.id} onValueChange={setYardId}>
              {openYards.map((row) => <SelectItem key={row.id} value={row.id}>{row.code} · {row.name}</SelectItem>)}
            </SelectField>
            <SelectField label="Transporter desk code" value={operator.id} onValueChange={setOperatorId}>
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
      ) : <p className="text-sm text-muted-foreground">{writer ? 'Every sample yard already has a contract.' : 'This role can read the desk and cannot file an application.'}</p>}
    </div>
  )
}

export function ContractListPage() {
  const ready = useParkingStore((state) => state.ready)
  const contracts = useParkingStore((state) => state.contracts)
  if (!ready) return <LoadingState label="Loading contracts" />
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-009" title="Parking contract approval" description="Mandi officials verify, approve, record a simulated deposit, and issue. Operators can open their application." actions={<Button type="button" variant="outline" asChild><Link to="/parking">Transport desk</Link></Button>} />
      <ParkingNotice />
      <ArticleList
        rows={contracts}
        searchText={(row) => `${row.contractNo} ${row.yardCode} ${row.operatorLabel}`}
        statusText={(row) => agreementLabel(row.status)}
        empty="No contract matches that search."
        render={(row) => (
          <article key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
            <div>
              <p className="font-medium">{row.contractNo} · {row.yardCode} · {row.operatorLabel}</p>
              <p className="mt-1">{row.start} to {row.end}</p>
            </div>
            <div className="flex items-center gap-2">
              <ParkingBadge tone={row.status === 'issued' ? 'ok' : 'warn'}>{agreementLabel(row.status)}</ParkingBadge>
              <Button type="button" size="sm" variant="outline" asChild><Link to={`/parking/contracts/${row.id}`}>Open</Link></Button>
            </div>
          </article>
        )}
      />
    </div>
  )
}

export function ContractDetailPage() {
  const { id = '' } = useParams()
  const ready = useParkingStore((state) => state.ready)
  const contract = useParkingStore((state) => state.contracts.find((row) => row.id === id))
  const moveParkingContract = useParkingStore((state) => state.moveParkingContract)
  const recordParkingDeposit = useParkingStore((state) => state.recordParkingDeposit)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const [deposit, setDeposit] = useState('5000')
  if (!ready) return <LoadingState label="Loading the contract" />
  if (!contract) return <EmptyState title="Contract not in this browser" description="That demonstration number is not in the parking book." />
  const official = roleId ? canDecideParking(roleId) : false
  const operator = roleId ? canOperateParking(roleId) : false
  const next = NEXT_AGREEMENT[contract.status].filter((status) => {
    if (status === 'submitted') return operator
    if (status === 'deposit-recorded') return false
    return official && officialMoves.includes(status)
  })

  function run(action: () => { ok: boolean; message?: string }) {
    const result = action()
    if (!result.ok) toast.error(result.message ?? 'The parking book refused that step.')
    else toast.success('The simulated contract moved. No deed was signed.')
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="SOP-009"
        title={contract.contractNo}
        description={`${contract.yardCode} · ${contract.operatorLabel} · ${contract.start} to ${contract.end}. Deposit and issue stay in this browser.`}
        actions={<Button type="button" variant="outline" asChild><Link to="/parking/contracts">All contracts</Link></Button>}
      />
      <ParkingNotice />
      <div className="flex flex-wrap items-center gap-2">
        <ParkingBadge tone={contract.status === 'issued' ? 'ok' : 'warn'}>{agreementLabel(contract.status)}</ParkingBadge>
        {contract.receiptId ? <span className="text-sm">{contract.receiptId} · {formatPaise(contract.depositPaise)} · DEMO / SIMULATED</span> : null}
      </div>
      <p className="text-sm">{contract.experience}</p>
      {official && contract.status === 'approved' ? (
        <div className="flex flex-wrap items-end gap-2">
          <TextField label="Simulated deposit" value={deposit} onChange={(event) => setDeposit(event.target.value)} hint="Above zero. At most two decimal places." />
          <Button type="button" onClick={() => {
            if (!roleId || !accountId) return
            const result = recordParkingDeposit({ roleId, accountId }, contract.id, deposit)
            if (!result.ok) toast.error(result.message)
            else toast.success(`${result.id} was noted. No money moved.`)
          }}>Record deposit</Button>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {next.map((status) => (
          <Button key={status} type="button" variant="outline" onClick={() => {
            if (!roleId || !accountId) return
            run(() => moveParkingContract({ roleId, accountId }, contract.id, status))
          }}>{agreementLabel(status)}</Button>
        ))}
      </div>
    </div>
  )
}
