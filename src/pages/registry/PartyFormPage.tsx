import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { TextAreaField } from '@/components/forms/TextAreaField'
import { TextField } from '@/components/forms/TextField'
import { SelectField } from '@/components/forms/SelectField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SelectItem } from '@/components/ui/select'
import { ActiveMandiNote, DocumentList, readDemoFile } from '@/features/registry/RegistryBits'
import { partyBasePath, partyRegister } from '@/features/registry/meta'
import { mandiName, validatePartyInput, workingMandi } from '@/services/registry-rules'
import { useRegistryStore } from '@/store/registry-store'
import type { DemoDocument, PartyInput, PartyKind } from '@/types/registry'

const formSchema = z.object({
  label: z.string(),
  area: z.string(),
  phone: z.string(),
  status: z.enum(['Active', 'Inactive']),
  commodityId: z.string(),
  notes: z.string(),
  vehicleNo: z.string(),
  siteCode: z.string(),
})

export function PartyFormPage({ kind }: { kind: PartyKind }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const meta = partyRegister(kind)
  const ready = useRegistryStore((state) => state.ready)
  const parties = useRegistryStore((state) => state.parties)
  const commodities = useRegistryStore((state) => state.commodities)
  const locations = useRegistryStore((state) => state.locations)
  const createParty = useRegistryStore((state) => state.createParty)
  const updateParty = useRegistryStore((state) => state.updateParty)
  const existing = id ? parties.find((party) => party.id === id && party.kind === kind) : undefined
  const mandi = existing ? locations.find((location) => location.id === existing.mandiId) : workingMandi(locations)
  const [documents, setDocuments] = useState<DemoDocument[]>([])
  const [fileError, setFileError] = useState<string | null>(null)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: '',
      area: '',
      phone: '',
      status: 'Active',
      commodityId: '',
      notes: '',
      vehicleNo: '',
      siteCode: '',
    },
  })

  const storedId = existing?.id ?? ''
  const storedUpdated = existing?.updatedAt ?? ''
  useEffect(() => {
    if (!ready) return
    const commodityId = existing?.commodityId || commodities.find((item) => item.mandiId === mandi?.id && item.status !== 'Removed')?.id || ''
    form.reset({
      label: existing?.label ?? '',
      area: existing?.area ?? '',
      phone: existing?.phone ?? '',
      status: existing?.status === 'Inactive' ? 'Inactive' : 'Active',
      commodityId,
      notes: existing?.notes ?? '',
      vehicleNo: existing?.vehicleNo ?? '',
      siteCode: existing?.siteCode ?? '',
    })
    setDocuments(existing?.documents ?? [])
  }, [ready, storedId, storedUpdated, existing, commodities, mandi, form.reset])

  if (!ready) return <LoadingState label="Loading the demonstration register" />
  if (id && !existing) {
    return <EmptyState title="Record not in this browser" description="That demonstration id is not on this register." actionLabel="Back to the list" onAction={() => navigate(partyBasePath(kind))} />
  }

  const commodityChoices = commodities.filter((item) => item.mandiId === mandi?.id && item.status !== 'Removed')

  async function addFiles(list: FileList | null) {
    if (!list) return
    const incoming = [...list]
    if (documents.length + incoming.length > 4) {
      setFileError('Attach up to 4 demonstration files.')
      return
    }
    const next = [...documents]
    for (const file of incoming) {
      const result = await readDemoFile(file)
      if ('error' in result) {
        setFileError(result.error)
        return
      }
      next.push(result.document)
    }
    setFileError(null)
    setDocuments(next)
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!mandi) {
      form.setError('label', { message: 'Choose a working mandi before saving.' })
      return
    }
    const input: PartyInput = { ...values, documents }
    const error = validatePartyInput(kind, input, parties, commodities, mandi.id, existing?.id)
    if (error) {
      form.setError(error.field as 'label', { message: error.message })
      return
    }
    const result = existing ? updateParty(existing.id, input) : createParty(kind, input)
    if (!result.ok) {
      form.setError('label', { message: result.message })
      return
    }
    toast.success(existing ? 'Demonstration record updated in this browser.' : `Registration id ${result.id} was saved in this browser.`)
    navigate(`${partyBasePath(kind)}/${result.id}`)
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="DEMO"
        title={existing ? `Edit ${existing.label}` : `Register a ${meta.singular.toLowerCase()}`}
        description={existing ? 'Saving updates the demonstration row in this browser.' : 'A DEMO registration id is assigned when you save. It is not filed with an office.'}
        actions={
          <Button type="button" variant="outline" asChild>
            <Link to={existing ? `${partyBasePath(kind)}/${existing.id}` : partyBasePath(kind)}>Cancel</Link>
          </Button>
        }
      />
      <ActiveMandiNote />
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{existing ? existing.id : 'New DEMO registration id'}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <p className="text-sm text-muted-foreground md:col-span-2">
              Mandi on this row: {mandi ? mandiName(locations, mandi.id) : 'None'}. The id is stored with the record.
            </p>
            {existing?.status === 'Removed' ? (
              <p className="text-sm text-muted-foreground md:col-span-2">This row is marked Removed. Saving with Active puts it back on the working list.</p>
            ) : null}
            <TextField label="Desk label" hint="Use a fictional code such as DG-14. Do not enter a real person’s name." error={form.formState.errors.label?.message} {...form.register('label')} />
            <TextField label="Area code" hint="A sample belt, not a street address." error={form.formState.errors.area?.message} {...form.register('area')} />
            <TextField label="Demonstration phone" hint="Example 70000-10014." error={form.formState.errors.phone?.message} {...form.register('phone')} />
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <SelectField label="Status" value={field.value} onValueChange={field.onChange} error={form.formState.errors.status?.message}>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectField>
              )}
            />
            {meta.commodity === 'required' ? (
              <Controller
                control={form.control}
                name="commodityId"
                render={({ field }) => (
                  <SelectField label="Commodity" value={field.value} onValueChange={field.onChange} error={form.formState.errors.commodityId?.message}>
                    {commodityChoices.map((item) => (
                      <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                    ))}
                  </SelectField>
                )}
              />
            ) : null}
            {meta.vehicle !== 'hidden' ? (
              <TextField label="Demonstration vehicle" hint="Example NL07-DEMO-214." error={form.formState.errors.vehicleNo?.message} {...form.register('vehicleNo')} />
            ) : null}
            {meta.site === 'required' ? (
              <TextField label={meta.siteLabel} hint="Example WH-D1 or FB-01." error={form.formState.errors.siteCode?.message} {...form.register('siteCode')} />
            ) : null}
            <div className="md:col-span-2">
              <TextAreaField label="Note" hint="Optional. 280 characters." error={form.formState.errors.notes?.message} {...form.register('notes')} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="grid gap-1.5 text-sm">
              Attach a preview
              <input
                type="file"
                accept="image/*,.pdf,.txt"
                multiple
                onChange={(event) => {
                  void addFiles(event.target.files)
                  event.target.value = ''
                }}
              />
            </label>
            <p className="text-xs text-muted-foreground">Images show a preview. Other files keep their name and size. Up to 4 files, 200 KB each. They stay in this browser.</p>
            {fileError ? <p className="text-xs text-destructive">{fileError}</p> : null}
            <DocumentList documents={documents} />
            {documents.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {documents.map((document) => (
                  <Button key={document.id} type="button" variant="outline" size="sm" onClick={() => setDocuments((current) => current.filter((item) => item.id !== document.id))}>
                    Remove {document.name}
                  </Button>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
        <Button type="submit">{existing ? 'Save changes' : 'Save demonstration record'}</Button>
      </form>
    </div>
  )
}
