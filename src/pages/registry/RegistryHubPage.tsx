import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { catalogRegisters, partyRegisters } from '@/features/registry/meta'
import { ActiveMandiNote } from '@/features/registry/RegistryBits'
import { workingMandi } from '@/services/registry-rules'
import { useRegistryStore } from '@/store/registry-store'

export function RegistryHubPage() {
  const ready = useRegistryStore((state) => state.ready)
  const parties = useRegistryStore((state) => state.parties)
  const commodities = useRegistryStore((state) => state.commodities)
  const grades = useRegistryStore((state) => state.grades)
  const units = useRegistryStore((state) => state.units)
  const locations = useRegistryStore((state) => state.locations)
  const fees = useRegistryStore((state) => state.fees)
  const resetRegistry = useRegistryStore((state) => state.resetRegistry)
  const [resetOpen, setResetOpen] = useState(false)
  const mandi = workingMandi(locations)

  if (!ready) return <LoadingState label="Loading the demonstration register" />

  const counts = {
    farmer: countParties('farmer'),
    buyer: countParties('buyer'),
    aadathiya: countParties('aadathiya'),
    transporter: countParties('transporter'),
    'warehouse-operator': countParties('warehouse-operator'),
    'facility-operator': countParties('facility-operator'),
    commodity: commodities.filter((row) => row.status !== 'Removed' && row.mandiId === mandi?.id).length,
    grade: grades.filter((row) => row.status !== 'Removed' && row.mandiId === mandi?.id).length,
    unit: units.filter((row) => row.status !== 'Removed' && row.mandiId === mandi?.id).length,
    location: locations.filter((row) => row.status !== 'Removed').length,
    fee: fees.filter((row) => row.status !== 'Removed' && row.mandiId === mandi?.id).length,
  }

  function countParties(kind: (typeof partyRegisters)[number]['kind']) {
    return parties.filter((party) => party.kind === kind && party.status !== 'Removed' && party.mandiId === mandi?.id).length
  }

  function restore() {
    resetRegistry()
    setResetOpen(false)
    toast.success('The demonstration registers were restored in this browser.')
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="DEMO"
        title="Stakeholders"
        description="Master registers for this browser. Creating a row does not enrol a person or open a licence."
        actions={
          <Button type="button" variant="outline" onClick={() => setResetOpen(true)}>
            Restore sample
          </Button>
        }
      />
      <ActiveMandiNote />
      <section className="space-y-3">
        <h2 className="font-display text-2xl">Parties</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {partyRegisters.map((item) => (
            <RegisterCard key={item.kind} title={item.title} description={item.description} count={counts[item.kind]} to={`/stakeholders/${item.path}`} />
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="font-display text-2xl">Mandi master data</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {catalogRegisters.map((item) => (
            <RegisterCard key={item.kind} title={item.title} description={item.description} count={counts[item.kind]} to={`/stakeholders/${item.path}`} />
          ))}
        </div>
      </section>
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore the sample registers?</DialogTitle>
            <DialogDescription>
              Rows you added or edited in this browser are replaced by the built-in demonstration sample. The signed-in role stays.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setResetOpen(false)}>Keep current rows</Button>
            <Button type="button" onClick={restore}>Restore sample</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RegisterCard({ title, description, count, to }: { title: string; description: string; count: number; to: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-3">
        <p>
          <span className="font-display block text-3xl leading-none">{count}</span>
          <span className="mt-1 block text-xs text-muted-foreground">on the working list</span>
        </p>
        <Button type="button" variant="outline" asChild>
          <Link to={to}>Open</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
