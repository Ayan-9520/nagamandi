import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArticleList } from '@/components/common/ArticleList'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/ui/button'
import { ChamberBadge, ColdNotice } from '@/features/cold-storage/ColdBits'
import { contractLabel } from '@/features/cold-storage/meta'
import { formatPaise } from '@/services/money'
import { canDecideContract, canOperateCold, NEXT_CONTRACT } from '@/services/cold-rules'
import { useColdStore } from '@/store/cold-store'
import { useSessionStore } from '@/store/session-store'
import type { ContractStatus } from '@/types/cold-storage'

const officialMoves: ContractStatus[] = ['under-verification', 'verified', 'clarification-required', 'approved', 'issued', 'rejected']

export function ContractListPage() {
  const ready = useColdStore((state) => state.ready)
  const contracts = useColdStore((state) => state.contracts)
  if (!ready) return <LoadingState label="Loading contracts" />
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="SOP-006" title="Contract approval" description="Mandi officials verify, approve, record a simulated deposit, and issue. Operators can open their application." actions={<Button type="button" variant="outline" asChild><Link to="/cold-storage">Cold storage desk</Link></Button>} />
      <ColdNotice />
      <ArticleList
        rows={contracts}
        searchText={(row) => `${row.contractNo} ${row.chamberCode} ${row.operatorLabel}`}
        statusText={(row) => contractLabel(row.status)}
        empty="No contract matches that search."
        render={(row) => (
          <article key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
            <div>
              <p className="font-medium">{row.contractNo} · {row.chamberCode} · {row.operatorLabel}</p>
              <p className="mt-1">{row.start} to {row.end}</p>
            </div>
            <div className="flex items-center gap-2">
              <ChamberBadge tone={row.status === 'issued' ? 'ok' : 'warn'}>{contractLabel(row.status)}</ChamberBadge>
              <Button type="button" size="sm" variant="outline" asChild><Link to={`/cold-storage/contracts/${row.id}`}>Open</Link></Button>
            </div>
          </article>
        )}
      />
    </div>
  )
}

export function ContractDetailPage() {
  const { id = '' } = useParams()
  const ready = useColdStore((state) => state.ready)
  const contract = useColdStore((state) => state.contracts.find((row) => row.id === id))
  const moveContract = useColdStore((state) => state.moveContract)
  const recordDeposit = useColdStore((state) => state.recordDeposit)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const [deposit, setDeposit] = useState('15000')
  if (!ready) return <LoadingState label="Loading the contract" />
  if (!contract) return <EmptyState title="Contract not in this browser" description="That demonstration number is not in the cold storage book." />
  const official = roleId ? canDecideContract(roleId) : false
  const operator = roleId ? canOperateCold(roleId) : false
  const next = NEXT_CONTRACT[contract.status].filter((status) => {
    if (status === 'submitted') return operator
    if (status === 'deposit-recorded') return false
    return official && officialMoves.includes(status)
  })

  function run(action: () => { ok: boolean; message?: string }) {
    const result = action()
    if (!result.ok) toast.error(result.message ?? 'The cold storage book refused that step.')
    else toast.success('The simulated contract moved. No deed was signed.')
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="SOP-006"
        title={contract.contractNo}
        description={`${contract.chamberCode} · ${contract.operatorLabel} · ${contract.start} to ${contract.end}. Deposit and issue stay in this browser.`}
        actions={<Button type="button" variant="outline" asChild><Link to="/cold-storage/contracts">All contracts</Link></Button>}
      />
      <ColdNotice />
      <div className="flex flex-wrap items-center gap-2">
        <ChamberBadge tone={contract.status === 'issued' ? 'ok' : 'warn'}>{contractLabel(contract.status)}</ChamberBadge>
        {contract.receiptId ? <span className="text-sm">{contract.receiptId} · {formatPaise(contract.depositPaise)} · DEMO / SIMULATED</span> : null}
      </div>
      <p className="text-sm">{contract.experience}</p>
      <div className="flex flex-wrap gap-2">
        {next.map((status) => (
          <Button key={status} type="button" size="sm" variant={status === 'rejected' ? 'outline' : 'default'} onClick={() => run(() => moveContract({ roleId: roleId!, accountId: accountId! }, contract.id, status))}>
            {status === 'under-verification' ? 'Start verification' : status === 'verified' ? 'Mark verified' : status === 'clarification-required' ? 'Ask for clarification' : status === 'approved' ? 'Approve contract' : status === 'issued' ? 'Issue contract' : status === 'submitted' ? 'Resubmit' : 'Reject'}
          </Button>
        ))}
        {contract.status === 'issued' ? <Button type="button" size="sm" variant="outline" asChild><Link to={`/cold-storage/contracts/${contract.id}/print`}>Contract preview</Link></Button> : null}
      </div>
      {official && contract.status === 'approved' ? (
        <div className="grid max-w-md gap-3">
          <TextField label="Simulated deposit in rupees" value={deposit} onChange={(event) => setDeposit(event.target.value)} hint="DEMO / SIMULATED. No cash and no transfer." />
          <Button type="button" onClick={() => run(() => recordDeposit({ roleId: roleId!, accountId: accountId! }, contract.id, deposit))}>Record deposit</Button>
        </div>
      ) : null}
      <h2 className="font-display text-xl">Steps</h2>
      {contract.history.map((step) => (
        <p key={`${step.at}-${step.status}`} className="text-sm">{contractLabel(step.status)} · {step.note}</p>
      ))}
    </div>
  )
}
