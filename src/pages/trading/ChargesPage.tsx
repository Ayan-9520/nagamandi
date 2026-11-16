import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingState } from '@/components/common/LoadingState'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TradeNotice } from '@/features/trading/TradeBits'
import { formatRupee } from '@/features/trading/meta'
import { canOpenTrade } from '@/services/trade-rules'
import { useSessionStore } from '@/store/session-store'
import { useTradeStore } from '@/store/trade-store'

function readNumber(value: string) {
  const text = value.trim()
  if (!text) return Number.NaN
  return Number(text)
}

export function ChargesPage() {
  const ready = useTradeStore((state) => state.ready)
  const rates = useTradeStore((state) => state.rates)
  const saveRates = useTradeStore((state) => state.saveRates)
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const [seller, setSeller] = useState('')
  const [buyer, setBuyer] = useState('')
  const [hamali, setHamali] = useState('')
  if (!ready) return <LoadingState label="Loading fictional charges" />
  const writer = roleId ? canOpenTrade(roleId) || roleId === 'accounts-officer' : false
  const sellerValue = seller.trim() ? readNumber(seller) : rates.sellerCommissionPercent
  const buyerValue = buyer.trim() ? readNumber(buyer) : rates.buyerCommissionPercent
  const hamaliValue = hamali.trim() ? readNumber(hamali) : rates.hamaliPerUnit

  function save() {
    if (!roleId || !accountId) return
    const result = saveRates({ roleId, accountId }, {
      sellerCommissionPercent: sellerValue,
      buyerCommissionPercent: buyerValue,
      hamaliPerUnit: hamaliValue,
    })
    if (!result.ok) toast.error(result.message)
    else {
      toast.success('The fictional schedule was saved in this browser. Confirmed trades keep their earlier rates.')
      setSeller('')
      setBuyer('')
      setHamali('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="DEMO · charges"
        title="Hamali and transport"
        description="Hamali is a fictional rupee rate per unit. Transport is entered on each price record and charged to the buyer."
        actions={<Button type="button" variant="outline" asChild><Link to="/trading/commission">Commission preview</Link></Button>}
      />
      <TradeNotice />
      <Card>
        <CardHeader><CardTitle>Fictional schedule</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Current seller commission {rates.sellerCommissionPercent}%, buyer commission {rates.buyerCommissionPercent}%, hamali {formatRupee(rates.hamaliPerUnit)} per unit. These are not mandi office rates.
          </p>
          {writer ? (
            <div className="grid gap-4 md:grid-cols-3">
              <TextField label="Seller commission %" value={seller} hint="0 to 15. Blank keeps the current rate." onChange={(event) => setSeller(event.target.value)} />
              <TextField label="Buyer commission %" value={buyer} hint="0 to 15. Blank keeps the current rate." onChange={(event) => setBuyer(event.target.value)} />
              <TextField label="Hamali per unit" value={hamali} hint="₹0 to ₹500. Blank keeps the current rate." onChange={(event) => setHamali(event.target.value)} />
              <div className="md:col-span-3">
                <Button type="button" onClick={save}>Save fictional rates</Button>
              </div>
            </div>
          ) : <p className="text-sm">This role can read the schedule. An aadathiya, manager, accounts or super admin desk can change it.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
