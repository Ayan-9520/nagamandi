import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { SelectField } from '@/components/forms/SelectField'
import { TextAreaField } from '@/components/forms/TextAreaField'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SelectItem } from '@/components/ui/select'
import { catalogBasePath, catalogRegister } from '@/features/registry/meta'
import { ActiveMandiNote } from '@/features/registry/RegistryBits'
import {
  validateCommodityInput,
  validateFeeInput,
  validateGradeInput,
  validateLocationInput,
  validateUnitInput,
  workingMandi,
} from '@/services/registry-rules'
import { useRegistryStore } from '@/store/registry-store'
import type { CatalogKind, WorkingStatus } from '@/types/registry'

const statusSchema = z.enum(['Active', 'Inactive'])

export function CatalogFormPage({ kind }: { kind: CatalogKind }) {
  const { id } = useParams()
  const ready = useRegistryStore((state) => state.ready)
  if (!ready) return <LoadingState label="Loading the demonstration register" />
  return <CatalogForm key={`${kind}-${id ?? 'new'}`} kind={kind} id={id} />
}

function CatalogForm({ kind, id }: { kind: CatalogKind; id?: string }) {
  const meta = catalogRegister(kind)
  const navigate = useNavigate()
  const base = catalogBasePath(kind)
  const store = useRegistryStore()
  const mandi = workingMandi(store.locations)
  const missing = id ? !rowExists(kind, id, store) : false
  if (missing) {
    return <EmptyState title="Record not in this browser" description="That demonstration id is not on this register." actionLabel="Back to the list" onAction={() => navigate(base)} />
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="DEMO"
        title={id ? `Edit ${meta.singular.toLowerCase()}` : `New ${meta.singular.toLowerCase()}`}
        description={id ? `${id} is updated in this browser only.` : `A DEMO-${meta.prefix} id is assigned when you save.`}
        actions={
          <Button type="button" variant="outline" asChild>
            <Link to={id ? `${base}/${id}` : base}>Cancel</Link>
          </Button>
        }
      />
      <ActiveMandiNote />
      <Card>
        <CardContent className="pt-6">
          {kind === 'commodity' ? <CommodityFields id={id} /> : null}
          {kind === 'grade' ? <GradeFields id={id} /> : null}
          {kind === 'unit' ? <UnitFields id={id} /> : null}
          {kind === 'location' ? <LocationFields id={id} /> : null}
          {kind === 'fee' ? <FeeFields id={id} /> : null}
          {kind !== 'location' ? <p className="mt-4 text-sm text-muted-foreground">Saved against {mandi?.name ?? 'the working mandi'} ({mandi?.id ?? 'none'}).</p> : null}
        </CardContent>
      </Card>
    </div>
  )
}

function CommodityFields({ id }: { id?: string }) {
  const navigate = useNavigate()
  const row = useRegistryStore((state) => state.commodities.find((item) => item.id === id))
  const commodities = useRegistryStore((state) => state.commodities)
  const locations = useRegistryStore((state) => state.locations)
  const createCommodity = useRegistryStore((state) => state.createCommodity)
  const updateCommodity = useRegistryStore((state) => state.updateCommodity)
  const form = useForm({
    resolver: zodResolver(z.object({ name: z.string(), category: z.string(), season: z.string(), status: statusSchema })),
    defaultValues: { name: row?.name ?? '', category: row?.category ?? '', season: row?.season ?? '', status: (row?.status === 'Inactive' ? 'Inactive' : 'Active') as WorkingStatus },
  })
  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((values) => {
      const mandiId = row?.mandiId ?? workingMandi(locations)?.id ?? ''
      const error = validateCommodityInput(values, commodities, mandiId, id)
      if (error) { form.setError(error.field as 'name', { message: error.message }); return }
      const result = id ? updateCommodity(id, values) : createCommodity(values)
      if (!result.ok) { form.setError('name', { message: result.message }); return }
      toast.success('Commodity saved in this browser.')
      navigate(`${catalogBasePath('commodity')}/${result.id}`)
    })}>
      <TextField label="Name" error={form.formState.errors.name?.message} {...form.register('name')} />
      <TextField label="Category" hint="Spice, fruit, grain or vegetable." error={form.formState.errors.category?.message} {...form.register('category')} />
      <TextField label="Season label" error={form.formState.errors.season?.message} {...form.register('season')} />
      <StatusSelect value={form.watch('status')} onChange={(value) => form.setValue('status', value)} error={form.formState.errors.status?.message} />
      <div className="md:col-span-2"><Button type="submit">Save commodity</Button></div>
    </form>
  )
}

function GradeFields({ id }: { id?: string }) {
  const navigate = useNavigate()
  const row = useRegistryStore((state) => state.grades.find((item) => item.id === id))
  const grades = useRegistryStore((state) => state.grades)
  const commodities = useRegistryStore((state) => state.commodities)
  const locations = useRegistryStore((state) => state.locations)
  const createGrade = useRegistryStore((state) => state.createGrade)
  const updateGrade = useRegistryStore((state) => state.updateGrade)
  const mandiId = row?.mandiId ?? workingMandi(locations)?.id ?? ''
  const choices = commodities.filter((item) => item.mandiId === mandiId && item.status !== 'Removed')
  const form = useForm({
    resolver: zodResolver(z.object({ commodityId: z.string(), name: z.string(), description: z.string(), status: statusSchema })),
    defaultValues: {
      commodityId: row?.commodityId || choices[0]?.id || '',
      name: row?.name ?? '',
      description: row?.description ?? '',
      status: (row?.status === 'Inactive' ? 'Inactive' : 'Active') as WorkingStatus,
    },
  })
  if (choices.length === 0) return <p className="text-sm text-muted-foreground">Add a commodity for the working mandi before adding a grade.</p>
  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((values) => {
      const error = validateGradeInput(values, grades, mandiId, id)
      if (error) { form.setError(error.field as 'name', { message: error.message }); return }
      const result = id ? updateGrade(id, values) : createGrade(values)
      if (!result.ok) { form.setError('name', { message: result.message }); return }
      toast.success('Grade saved in this browser.')
      navigate(`${catalogBasePath('grade')}/${result.id}`)
    })}>
      <SelectField label="Commodity" value={form.watch('commodityId')} onValueChange={(value) => form.setValue('commodityId', value)} error={form.formState.errors.commodityId?.message}>
        {choices.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
      </SelectField>
      <TextField label="Grade" error={form.formState.errors.name?.message} {...form.register('name')} />
      <div className="md:col-span-2">
        <TextAreaField label="Description" error={form.formState.errors.description?.message} {...form.register('description')} />
      </div>
      <StatusSelect value={form.watch('status')} onChange={(value) => form.setValue('status', value)} error={form.formState.errors.status?.message} />
      <div className="md:col-span-2"><Button type="submit">Save grade</Button></div>
    </form>
  )
}

function UnitFields({ id }: { id?: string }) {
  const navigate = useNavigate()
  const row = useRegistryStore((state) => state.units.find((item) => item.id === id))
  const units = useRegistryStore((state) => state.units)
  const locations = useRegistryStore((state) => state.locations)
  const createUnit = useRegistryStore((state) => state.createUnit)
  const updateUnit = useRegistryStore((state) => state.updateUnit)
  const form = useForm({
    resolver: zodResolver(z.object({ name: z.string(), symbol: z.string(), kind: z.enum(['Weight', 'Count', 'Volume']), status: statusSchema })),
    defaultValues: { name: row?.name ?? '', symbol: row?.symbol ?? '', kind: row?.kind ?? 'Weight', status: (row?.status === 'Inactive' ? 'Inactive' : 'Active') as WorkingStatus },
  })
  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((values) => {
      const mandiId = row?.mandiId ?? workingMandi(locations)?.id ?? ''
      const error = validateUnitInput(values, units, mandiId, id)
      if (error) { form.setError(error.field as 'name', { message: error.message }); return }
      const result = id ? updateUnit(id, values) : createUnit(values)
      if (!result.ok) { form.setError('name', { message: result.message }); return }
      toast.success('Unit saved in this browser.')
      navigate(`${catalogBasePath('unit')}/${result.id}`)
    })}>
      <TextField label="Name" error={form.formState.errors.name?.message} {...form.register('name')} />
      <TextField label="Symbol" hint="kg, q or MT." error={form.formState.errors.symbol?.message} {...form.register('symbol')} />
      <SelectField label="Kind" value={form.watch('kind')} onValueChange={(value) => form.setValue('kind', value as 'Weight' | 'Count' | 'Volume')} error={form.formState.errors.kind?.message}>
        <SelectItem value="Weight">Weight</SelectItem>
        <SelectItem value="Count">Count</SelectItem>
        <SelectItem value="Volume">Volume</SelectItem>
      </SelectField>
      <StatusSelect value={form.watch('status')} onChange={(value) => form.setValue('status', value)} error={form.formState.errors.status?.message} />
      <div className="md:col-span-2"><Button type="submit">Save unit</Button></div>
    </form>
  )
}

function LocationFields({ id }: { id?: string }) {
  const navigate = useNavigate()
  const row = useRegistryStore((state) => state.locations.find((item) => item.id === id))
  const locations = useRegistryStore((state) => state.locations)
  const createLocation = useRegistryStore((state) => state.createLocation)
  const updateLocation = useRegistryStore((state) => state.updateLocation)
  const form = useForm({
    resolver: zodResolver(z.object({ name: z.string(), district: z.string(), code: z.string(), status: statusSchema, active: z.boolean() })),
    defaultValues: { name: row?.name ?? '', district: row?.district ?? '', code: row?.code ?? '', status: (row?.status === 'Inactive' ? 'Inactive' : 'Active') as WorkingStatus, active: row?.active ?? false },
  })
  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((values) => {
      const input = { ...values, code: values.code.toUpperCase() }
      const error = validateLocationInput(input, locations, id)
      if (error) { form.setError(error.field as 'name', { message: error.message }); return }
      const result = id ? updateLocation(id, input) : createLocation(input)
      if (!result.ok) { form.setError('name', { message: result.message }); return }
      toast.success('Mandi location saved in this browser.')
      navigate(`${catalogBasePath('location')}/${result.id}`)
    })}>
      <TextField label="Name" error={form.formState.errors.name?.message} {...form.register('name')} />
      <TextField label="District label" error={form.formState.errors.district?.message} {...form.register('district')} />
      <TextField label="Code" hint="Uppercase, such as DMP." error={form.formState.errors.code?.message} {...form.register('code')} />
      <StatusSelect value={form.watch('status')} onChange={(value) => form.setValue('status', value)} error={form.formState.errors.status?.message} />
      <label className="flex items-center gap-2 text-sm md:col-span-2">
        <input type="checkbox" className="size-4" {...form.register('active')} />
        Use as the working mandi
      </label>
      {form.formState.errors.active ? <p className="text-xs text-destructive md:col-span-2">{form.formState.errors.active.message}</p> : null}
      <div className="md:col-span-2"><Button type="submit">Save location</Button></div>
    </form>
  )
}

function FeeFields({ id }: { id?: string }) {
  const navigate = useNavigate()
  const row = useRegistryStore((state) => state.fees.find((item) => item.id === id))
  const fees = useRegistryStore((state) => state.fees)
  const locations = useRegistryStore((state) => state.locations)
  const createFee = useRegistryStore((state) => state.createFee)
  const updateFee = useRegistryStore((state) => state.updateFee)
  const form = useForm({
    resolver: zodResolver(z.object({ name: z.string(), basis: z.string(), sampleRate: z.string(), status: statusSchema })),
    defaultValues: { name: row?.name ?? '', basis: row?.basis ?? '', sampleRate: row?.sampleRate ?? '', status: (row?.status === 'Inactive' ? 'Inactive' : 'Active') as WorkingStatus },
  })
  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((values) => {
      const mandiId = row?.mandiId ?? workingMandi(locations)?.id ?? ''
      const error = validateFeeInput(values, fees, mandiId, id)
      if (error) { form.setError(error.field as 'name', { message: error.message }); return }
      const result = id ? updateFee(id, values) : createFee(values)
      if (!result.ok) { form.setError('name', { message: result.message }); return }
      toast.success('Fee category saved in this browser.')
      navigate(`${catalogBasePath('fee')}/${result.id}`)
    })}>
      <TextField label="Name" error={form.formState.errors.name?.message} {...form.register('name')} />
      <TextField label="Basis" hint="Per quintal, per vehicle, or per lot." error={form.formState.errors.basis?.message} {...form.register('basis')} />
      <TextField label="Sample rate" hint="A label only. Nothing is collected." error={form.formState.errors.sampleRate?.message} {...form.register('sampleRate')} />
      <StatusSelect value={form.watch('status')} onChange={(value) => form.setValue('status', value)} error={form.formState.errors.status?.message} />
      <div className="md:col-span-2"><Button type="submit">Save fee category</Button></div>
    </form>
  )
}

function StatusSelect({ value, onChange, error }: { value: WorkingStatus; onChange: (value: WorkingStatus) => void; error?: string }) {
  return (
    <SelectField label="Status" value={value} onValueChange={(next) => onChange(next as WorkingStatus)} error={error}>
      <SelectItem value="Active">Active</SelectItem>
      <SelectItem value="Inactive">Inactive</SelectItem>
    </SelectField>
  )
}

function rowExists(kind: CatalogKind, id: string, store: ReturnType<typeof useRegistryStore.getState>) {
  if (kind === 'commodity') return store.commodities.some((row) => row.id === id)
  if (kind === 'grade') return store.grades.some((row) => row.id === id)
  if (kind === 'unit') return store.units.some((row) => row.id === id)
  if (kind === 'location') return store.locations.some((row) => row.id === id)
  return store.fees.some((row) => row.id === id)
}
