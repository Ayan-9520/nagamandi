import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { SelectField } from '@/components/forms/SelectField'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SelectItem } from '@/components/ui/select'
import { ArrivalNotice } from '@/features/arrivals/ArrivalBits'
import { DocumentList, readDemoFile } from '@/features/registry/RegistryBits'
import { isWeighBay, round3 } from '@/services/arrival-rules'
import { mandiName, workingMandi } from '@/services/registry-rules'
import { useArrivalStore } from '@/store/arrival-store'
import { useRegistryStore } from '@/store/registry-store'
import { useSessionStore } from '@/store/session-store'
import type { ArrivalInput } from '@/types/arrival'
import type { CommodityRecord, DemoDocument, GradeRecord, Party, UnitRecord } from '@/types/registry'

const formSchema = z.object({
  sellerId: z.string(),
  aadathiyaId: z.string(),
  commodityId: z.string(),
  gradeId: z.string(),
  unitId: z.string(),
  quantity: z.string(),
  gross: z.string(),
  tare: z.string(),
  bay: z.string(),
  crateCount: z.string(),
  crateCode: z.string(),
  vehicleNo: z.string(),
  note: z.string(),
})

type FormValues = z.infer<typeof formSchema>

function readNumber(value: string) {
  const text = value.trim()
  if (!text) return Number.NaN
  return Number(text)
}

export function ArrivalFormPage() {
  const navigate = useNavigate()
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const registryReady = useRegistryStore((state) => state.ready)
  const arrivalReady = useArrivalStore((state) => state.ready)
  const parties = useRegistryStore((state) => state.parties)
  const commodities = useRegistryStore((state) => state.commodities)
  const grades = useRegistryStore((state) => state.grades)
  const units = useRegistryStore((state) => state.units)
  const locations = useRegistryStore((state) => state.locations)
  if (!registryReady || !arrivalReady || !roleId || !accountId) return <LoadingState label="Loading the demonstration gate" />
  const mandi = workingMandi(locations)
  const sellers = parties.filter((row) => row.kind === 'farmer' && row.status === 'Active' && row.mandiId === mandi?.id)
  const agents = parties.filter((row) => row.kind === 'aadathiya' && row.status === 'Active' && row.mandiId === mandi?.id)
  const goods = commodities.filter((row) => row.status === 'Active' && row.mandiId === mandi?.id && grades.some((grade) => grade.status === 'Active' && grade.commodityId === row.id))
  const measures = units.filter((row) => row.status === 'Active' && row.mandiId === mandi?.id)
  if (!mandi || sellers.length === 0 || agents.length === 0 || goods.length === 0 || measures.length === 0) {
    return <EmptyState title="The gate needs registers" description="The working mandi needs an active seller, aadathiya, commodity with a grade, and a unit." actionLabel="Arrival desk" onAction={() => navigate('/arrivals')} />
  }
  const firstGrade = grades.find((row) => row.status === 'Active' && row.commodityId === goods[0]?.id)
  if (!firstGrade) return <EmptyState title="The gate needs a grade" description="Add an active grade for a commodity on the working mandi." actionLabel="Arrival desk" onAction={() => navigate('/arrivals')} />
  return (
    <ArrivalFields
      roleId={roleId}
      accountId={accountId}
      mandiId={mandi.id}
      mandiLabel={`${mandiName(locations, mandi.id)} (${mandi.id})`}
      sellers={sellers}
      agents={agents}
      goods={goods}
      grades={grades.filter((row) => row.status === 'Active')}
      measures={measures}
      defaults={{
        sellerId: sellers[0].id,
        aadathiyaId: agents[0].id,
        commodityId: goods[0].id,
        gradeId: firstGrade.id,
        unitId: measures.find((row) => row.symbol === 'q')?.id ?? measures[0].id,
      }}
    />
  )
}

function ArrivalFields({
  roleId,
  accountId,
  mandiId,
  mandiLabel,
  sellers,
  agents,
  goods,
  grades,
  measures,
  defaults,
}: {
  roleId: NonNullable<ReturnType<typeof useSessionStore.getState>['roleId']>
  accountId: string
  mandiId: string
  mandiLabel: string
  sellers: Party[]
  agents: Party[]
  goods: CommodityRecord[]
  grades: GradeRecord[]
  measures: UnitRecord[]
  defaults: Pick<FormValues, 'sellerId' | 'aadathiyaId' | 'commodityId' | 'gradeId' | 'unitId'>
}) {
  const navigate = useNavigate()
  const createLot = useArrivalStore((state) => state.createLot)
  const [photos, setPhotos] = useState<DemoDocument[]>([])
  const [fileError, setFileError] = useState('')
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...defaults,
      quantity: '',
      gross: '',
      tare: '',
      bay: 'WB-01',
      crateCount: '0',
      crateCode: '',
      vehicleNo: '',
      note: '',
    },
  })
  const commodityId = form.watch('commodityId')
  const grossText = form.watch('gross')
  const tareText = form.watch('tare')
  const gradeChoices = grades.filter((row) => row.commodityId === commodityId)
  const gross = readNumber(grossText)
  const tare = readNumber(tareText)
  const netHint = Number.isFinite(gross) && Number.isFinite(tare)
    ? `Computed net: ${round3(gross - tare)}. The quantity must match this net.`
    : 'Net is gross minus tare, and it must match the quantity.'

  async function attach(list: FileList | null) {
    const file = list?.[0]
    if (!file) return
    if (photos.length >= 3) {
      setFileError('Attach at most three demonstration photos.')
      return
    }
    const result = await readDemoFile(file)
    if ('error' in result) {
      setFileError(result.error)
      return
    }
    setFileError('')
    setPhotos((current) => [...current, result.document])
  }

  function onSubmit(values: FormValues) {
    if (!isWeighBay(values.bay)) {
      form.setError('bay', { message: 'Choose WB-01 or WB-02.' })
      return
    }
    const input: ArrivalInput = {
      sellerId: values.sellerId,
      aadathiyaId: values.aadathiyaId,
      commodityId: values.commodityId,
      gradeId: values.gradeId,
      unitId: values.unitId,
      quantity: readNumber(values.quantity),
      gross: readNumber(values.gross),
      tare: readNumber(values.tare),
      bay: values.bay,
      crateCount: readNumber(values.crateCount),
      crateCode: values.crateCode,
      vehicleNo: values.vehicleNo,
      note: values.note,
      photos,
    }
    const result = createLot({ roleId, accountId }, input, {
      seller: sellers.find((row) => row.id === values.sellerId),
      aadathiya: agents.find((row) => row.id === values.aadathiyaId),
      commodity: goods.find((row) => row.id === values.commodityId),
      grade: gradeChoices.find((row) => row.id === values.gradeId),
      unit: measures.find((row) => row.id === values.unitId),
      mandiId,
    })
    if (!result.ok) {
      toast.error(result.message)
      return
    }
    toast.success(`${result.id} was saved in this browser.`)
    navigate(`/arrivals/${result.id}`)
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="DEMO · gate"
        title="New goods arrival"
        description="Seller, aadathiya, commodity, weighment and crates are stored together as one demonstration lot."
        actions={<Button type="button" variant="outline" asChild><Link to="/arrivals">Cancel</Link></Button>}
      />
      <ArrivalNotice />
      <p className="text-sm text-muted-foreground">Mandi on this lot: {mandiLabel}.</p>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader><CardTitle>Seller and aadathiya</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Controller control={form.control} name="sellerId" render={({ field }) => (
              <SelectField label="Seller" value={field.value} onValueChange={field.onChange}>
                {sellers.map((row) => <SelectItem key={row.id} value={row.id}>{row.label}</SelectItem>)}
              </SelectField>
            )} />
            <Controller control={form.control} name="aadathiyaId" render={({ field }) => (
              <SelectField label="Aadathiya" value={field.value} onValueChange={field.onChange}>
                {agents.map((row) => <SelectItem key={row.id} value={row.id}>{row.label}</SelectItem>)}
              </SelectField>
            )} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Commodity, grade and quantity</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Controller control={form.control} name="commodityId" render={({ field }) => (
              <SelectField label="Commodity" value={field.value} onValueChange={(value) => {
                field.onChange(value)
                const next = grades.find((row) => row.commodityId === value)
                form.setValue('gradeId', next?.id ?? '')
              }}>
                {goods.map((row) => <SelectItem key={row.id} value={row.id}>{row.name}</SelectItem>)}
              </SelectField>
            )} />
            <Controller control={form.control} name="gradeId" render={({ field }) => (
              <SelectField label="Grade" value={field.value} onValueChange={field.onChange}>
                {gradeChoices.map((row) => <SelectItem key={row.id} value={row.id}>{row.name}</SelectItem>)}
              </SelectField>
            )} />
            <Controller control={form.control} name="unitId" render={({ field }) => (
              <SelectField label="Unit" value={field.value} onValueChange={field.onChange}>
                {measures.map((row) => <SelectItem key={row.id} value={row.id}>{row.name} ({row.symbol})</SelectItem>)}
              </SelectField>
            )} />
            <TextField label="Quantity" hint="Greater than zero. At most three decimal places." {...form.register('quantity')} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Weighment record</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <TextField label="Gross" hint={netHint} {...form.register('gross')} />
            <TextField label="Tare" hint="Zero is allowed. A negative tare is rejected." {...form.register('tare')} />
            <Controller control={form.control} name="bay" render={({ field }) => (
              <SelectField label="Weigh bay" value={field.value} onValueChange={field.onChange}>
                <SelectItem value="WB-01">WB-01 north</SelectItem>
                <SelectItem value="WB-02">WB-02 south</SelectItem>
              </SelectField>
            )} />
            <TextField label="Demonstration vehicle" hint="Example NL07-DEMO-214." {...form.register('vehicleNo')} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Crate inventory and photos</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Crate count" hint="A whole number from 0 to 500." {...form.register('crateCount')} />
              <TextField label="Crate code" hint="Required when the count is above zero. Example CR-14." {...form.register('crateCode')} />
            </div>
            <label className="grid gap-1 text-sm">
              Photo
              <input type="file" accept="image/*" onChange={(event) => { void attach(event.target.files); event.target.value = '' }} />
            </label>
            {fileError ? <p className="text-xs text-destructive">{fileError}</p> : null}
            <DocumentList documents={photos} />
            <TextField label="Gate note" {...form.register('note')} />
          </CardContent>
        </Card>
        <Button type="submit">Register demonstration lot</Button>
      </form>
    </div>
  )
}
