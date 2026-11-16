import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { SelectField } from '@/components/forms/SelectField'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SelectItem } from '@/components/ui/select'
import { LicenceDocuments, LicenceNotice, StepGate, canUseStep } from '@/features/licences/LicenceBits'
import { applicantPartyKinds, categoryForParty, categoryLabel, licenceDesk } from '@/features/licences/meta'
import { readDemoFile } from '@/features/registry/RegistryBits'
import { validateLicenceInput } from '@/services/licence-rules'
import { mandiName, workingMandi } from '@/services/registry-rules'
import { useLicenceStore } from '@/store/licence-store'
import { useRegistryStore } from '@/store/registry-store'
import { useSessionStore } from '@/store/session-store'
import type { DocSlot, LicenceDocument, LicenceInput, RequestKind } from '@/types/licence'

const slots: DocSlot[] = ['identity', 'registration', 'tax', 'additional']

const schema = z.object({
  partyId: z.string(),
  applicantLabel: z.string(),
  area: z.string(),
  phone: z.string(),
  email: z.string(),
  businessName: z.string(),
  businessArea: z.string(),
  registrationNo: z.string(),
  taxId: z.string(),
  declared: z.boolean(),
})

export function LicenceApplyPage({ mode }: { mode: Extract<RequestKind, 'new'> | 'renewal' | 'modification' }) {
  const ready = useLicenceStore((state) => state.ready)
  const registryReady = useRegistryStore((state) => state.ready)
  const roleId = useSessionStore((state) => state.roleId)
  if (!ready || !registryReady || !roleId) return <LoadingState label="Loading the demonstration licence desk" />
  const desk = licenceDesk(roleId)
  return (
    <StepGate allow={canUseStep(desk, 'apply') || mode !== 'new'} step="apply">
      <ApplyForm mode={mode} />
    </StepGate>
  )
}

function ApplyForm({ mode }: { mode: 'new' | 'renewal' | 'modification' }) {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const roleId = useSessionStore((state) => state.roleId)
  const accountId = useSessionStore((state) => state.accountId)
  const cases = useLicenceStore((state) => state.cases)
  const createApplication = useLicenceStore((state) => state.createApplication)
  const createFollowUp = useLicenceStore((state) => state.createFollowUp)
  const parties = useRegistryStore((state) => state.parties)
  const locations = useRegistryStore((state) => state.locations)
  const parent = mode === 'new' ? undefined : cases.find((row) => row.id === id)
  const mandi = workingMandi(locations)
  const kinds = roleId ? applicantPartyKinds(roleId) : []
  const choices = parties.filter((party) => party.status === 'Active' && kinds.includes(party.kind) && (!mandi || party.mandiId === mandi.id))
  const lockedParty = parent ? parties.find((party) => party.id === parent.partyId) : undefined
  const initialParty = lockedParty?.id ?? choices[0]?.id ?? ''
  const [documents, setDocuments] = useState<LicenceDocument[]>(parent?.documents ?? [])
  const [fileError, setFileError] = useState<string | null>(null)
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      partyId: initialParty,
      applicantLabel: parent?.applicantLabel ?? lockedParty?.label ?? choices[0]?.label ?? '',
      area: parent?.area ?? lockedParty?.area ?? choices[0]?.area ?? '',
      phone: parent?.phone ?? lockedParty?.phone ?? choices[0]?.phone ?? '',
      email: parent?.email ?? '',
      businessName: parent?.businessName ?? '',
      businessArea: parent?.businessArea ?? lockedParty?.area ?? choices[0]?.area ?? '',
      registrationNo: parent?.registrationNo ?? '',
      taxId: parent?.taxId ?? '',
      declared: false,
    },
  })
  const partyId = form.watch('partyId')
  const party = parties.find((item) => item.id === partyId)

  if (!roleId || !accountId) return null
  const actor = { roleId, accountId }
  if (mode !== 'new' && (!parent || parent.status !== 'issued' || parent.supersededBy)) {
    return <EmptyState title="No current demonstration licence" description="Renew or modify a licence that is still current in this browser." actionLabel="Back to the register" onAction={() => navigate('/licences/register')} />
  }
  if (mode === 'new' && choices.length === 0) {
    return <EmptyState title="No desk code is available" description="The working mandi has no active seller, buyer or trader code for this role." actionLabel="Back to the licence desk" onAction={() => navigate('/licences')} />
  }
  const category = party ? categoryForParty(party.kind) : null
  const title = mode === 'renewal' ? 'Renew a demonstration licence' : mode === 'modification' ? 'Modify a demonstration licence' : 'New licence application'

  async function attach(slot: DocSlot, list: FileList | null) {
    const file = list?.[0]
    if (!file) return
    const result = await readDemoFile(file)
    if ('error' in result) {
      setFileError(result.error)
      return
    }
    setFileError(null)
    setDocuments((current) => [...current.filter((item) => item.slot !== slot), { ...result.document, slot }])
  }

  function onSubmit(values: z.infer<typeof schema>) {
    if (!mandi || !party || !category) {
      form.setError('partyId', { message: 'Choose a working mandi and an active desk code.' })
      return
    }
    const input: LicenceInput = { ...values, documents }
    const error = validateLicenceInput(input, party)
    if (error) {
      form.setError(error.field === 'documents' || error.field === 'declared' ? 'partyId' : error.field, { message: error.message })
      if (error.field === 'documents') setFileError(error.message)
      if (error.field === 'declared') form.setError('declared', { message: error.message })
      return
    }
    const result = mode === 'new' ? createApplication(actor, input, party, mandi.id) : createFollowUp(actor, parent!.id, mode, input, party)
    if (!result.ok) {
      form.setError('partyId', { message: result.message })
      return
    }
    toast.success(`${result.id} was saved in this browser.`)
    navigate(`/licences/${result.id}`)
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="DEMO · SOP-001"
        title={title}
        description="Applicant and business details stay in this browser. The declaration does not create an office filing."
        actions={<Button type="button" variant="outline" asChild><Link to="/licences">Cancel</Link></Button>}
      />
      <LicenceNotice />
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader><CardTitle>Applicant details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <p className="text-sm text-muted-foreground md:col-span-2">Mandi on this application: {mandi ? `${mandiName(locations, mandi.id)} (${mandi.id})` : 'None'}.</p>
            <Controller
              control={form.control}
              name="partyId"
              render={({ field }) => (
                <SelectField label="Desk code" value={field.value} onValueChange={(value) => {
                  field.onChange(value)
                  const next = parties.find((item) => item.id === value)
                  if (!next || parent) return
                  form.setValue('applicantLabel', next.label)
                  form.setValue('area', next.area)
                  form.setValue('phone', next.phone)
                  form.setValue('businessArea', next.area)
                }} error={form.formState.errors.partyId?.message}>
                  {(parent ? [lockedParty].filter((item) => item !== undefined) : choices).map((item) => (
                    <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>
                  ))}
                </SelectField>
              )}
            />
            <TextField label="Category" value={category ? categoryLabel(category) : 'Choose a desk code'} readOnly />
            <TextField label="Applicant desk label" hint="A fictional code such as DG-14." error={form.formState.errors.applicantLabel?.message} {...form.register('applicantLabel')} />
            <TextField label="Area code" error={form.formState.errors.area?.message} {...form.register('area')} />
            <TextField label="Demonstration phone" hint="Example 70000-10014." error={form.formState.errors.phone?.message} {...form.register('phone')} />
            <TextField label="Demonstration email" hint="Example dg14@demo.mandi." error={form.formState.errors.email?.message} {...form.register('email')} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Business details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <TextField label="Business code" hint="Example DG-14 stall." error={form.formState.errors.businessName?.message} {...form.register('businessName')} />
            <TextField label="Business area" error={form.formState.errors.businessArea?.message} {...form.register('businessArea')} />
            <TextField label="Registration number" hint="Example DEMO-BR-1008." error={form.formState.errors.registrationNo?.message} {...form.register('registrationNo')} />
            <TextField label="Tax identification" hint="Example DEMO-TAX-10008." error={form.formState.errors.taxId?.message} {...form.register('taxId')} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Supporting documents</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              {slots.map((slot) => (
                <label key={slot} className="grid gap-1 text-sm">
                  {slot === 'identity' ? 'Proof of identity' : slot === 'registration' ? 'Business registration' : slot === 'tax' ? 'Tax identification' : 'Additional document'}
                  <input type="file" accept="image/*,.pdf,.txt" onChange={(event) => { void attach(slot, event.target.files); event.target.value = '' }} />
                </label>
              ))}
            </div>
            {fileError ? <p className="text-xs text-destructive">{fileError}</p> : null}
            <LicenceDocuments documents={documents} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 pt-6">
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1" {...form.register('declared')} />
              <span>I declare that these demonstration details are fictional and that this submission stays in this browser.</span>
            </label>
            {form.formState.errors.declared ? <p className="text-xs text-destructive">{form.formState.errors.declared.message}</p> : null}
            <Button type="submit">{mode === 'new' ? 'Submit demonstration application' : 'Submit follow-up'}</Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
