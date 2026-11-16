import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function DemoStatus() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button type="button" variant="ghost" className="h-7 px-1.5" onClick={() => setOpen(true)}>
        <Badge className="bg-gold text-gold-foreground hover:bg-gold">DEMO DATA</Badge>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demonstration data</DialogTitle>
            <DialogDescription>
              Every figure in Naga Mandi OS is a fictional operating sample for the Nagaland Mandi desk.
            </DialogDescription>
          </DialogHeader>
          <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
            <li>Licence numbers, receipts, lot numbers, parchis, finance notes, warehouse contracts, cold storage contracts, FLP batches, parking passes, office leases, facility leases, stay records, compliance notes, audit rows, field drafts and QR codes are simulated. They are not permits, payments, deeds, process certificates, gate passes, bookings or authoritative evidence. Temperature figures are a sample script, not a probe.</li>
            <li>Money figures are DEMO / SIMULATED. No payment gateway, bank transfer or ledger posting is made.</li>
            <li>Notes and preferences stay in this browser.</li>
            <li>Sign-in and permissions are simulated. They do not identify an officer or protect a record.</li>
            <li>Krishora is not part of this application.</li>
          </ul>
        </DialogContent>
      </Dialog>
    </>
  )
}
