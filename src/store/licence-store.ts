import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { categoryForParty, licenceDesk } from '@/features/licences/meta'
import { createLicenceSeed } from '@/mocks/licence-seed'
import { checklistBlock, emptyFee, validateLicenceInput, validityFor } from '@/services/licence-rules'
import { storageKeys } from '@/services/storage'
import type { RoleId } from '@/types/access'
import type {
  LicenceCase,
  LicenceChecklist,
  LicenceData,
  LicenceEvent,
  LicenceInput,
  PaymentMethod,
  RequestKind,
  SaveResult,
} from '@/types/licence'
import type { Party } from '@/types/registry'

export interface LicenceActor {
  roleId: RoleId
  accountId: string
}

interface LicenceState extends LicenceData {
  ready: boolean
  setReady: () => void
  resetLicences: () => void
  createApplication: (actor: LicenceActor, input: LicenceInput, party: Party, mandiId: string) => SaveResult
  createFollowUp: (actor: LicenceActor, parentId: string, kind: Extract<RequestKind, 'renewal' | 'modification'>, input: LicenceInput, party: Party) => SaveResult
  resubmit: (actor: LicenceActor, id: string, note: string, input: LicenceInput) => SaveResult
  startVerification: (actor: LicenceActor, id: string) => SaveResult
  forwardToManager: (actor: LicenceActor, id: string, checklist: LicenceChecklist) => SaveResult
  requestClarification: (actor: LicenceActor, id: string, note: string) => SaveResult
  rejectCase: (actor: LicenceActor, id: string, note: string) => SaveResult
  approveCase: (actor: LicenceActor, id: string, note: string) => SaveResult
  recordFee: (actor: LicenceActor, id: string, method: PaymentMethod) => SaveResult
  issueLicence: (actor: LicenceActor, id: string) => SaveResult
}

function stamp() {
  return new Date().toISOString()
}

function takeSeq(seq: number) {
  return { seq: seq + 1, next: seq }
}

function event(seq: number, title: string, detail: string): LicenceEvent {
  return { id: `EVT-${seq}`, at: stamp(), title, detail }
}

function fail(message: string): SaveResult {
  return { ok: false, message }
}

function guard(actor: LicenceActor, desks: Array<ReturnType<typeof licenceDesk>>) {
  const desk = licenceDesk(actor.roleId)
  if (desk === 'oversight' || desks.includes(desk)) return null
  return 'This demonstration step belongs to another desk.'
}

function owns(actor: LicenceActor, row: LicenceCase) {
  return licenceDesk(actor.roleId) === 'oversight' || row.ownerAccountId === actor.accountId
}

function patch(cases: LicenceCase[], id: string, next: LicenceCase) {
  return cases.map((row) => (row.id === id ? next : row))
}

export const useLicenceStore = create<LicenceState>()(
  persist(
    (set, get) => ({
      ...createLicenceSeed(),
      ready: false,
      setReady: () => set({ ready: true }),
      resetLicences: () => set({ ...createLicenceSeed(), ready: true }),
      createApplication: (actor, input, party, mandiId) => {
        const denied = guard(actor, ['applicant', 'officer'])
        if (denied) return fail(denied)
        if (licenceDesk(actor.roleId) === 'applicant' && !categoryForParty(party.kind)) return fail('This desk can apply only for its own party kind.')
        const error = validateLicenceInput(input, party)
        if (error) return fail(error.message)
        const category = categoryForParty(party.kind)
        if (!category) return fail('Choose a seller, buyer or aadathiya desk code.')
        const { seq, next } = takeSeq(get().seq)
        const id = `DEMO-APP-${next}`
        const now = stamp()
        const row: LicenceCase = {
          id,
          mandiId,
          kind: 'new',
          status: 'submitted',
          category,
          partyId: party.id,
          ownerAccountId: actor.accountId,
          applicantLabel: input.applicantLabel.trim(),
          area: input.area.trim(),
          phone: input.phone.trim(),
          email: input.email.trim(),
          businessName: input.businessName.trim(),
          businessArea: input.businessArea.trim(),
          registrationNo: input.registrationNo.trim(),
          taxId: input.taxId.trim(),
          documents: input.documents,
          checklist: {
            identity: 'pending',
            registration: 'pending',
            tax: 'pending',
            additional: 'pending',
            formComplete: 'pending',
            documentsAttached: 'pending',
            remarks: '',
          },
          officerNote: '',
          managerNote: '',
          clarificationNote: '',
          clarificationFrom: '',
          rejectionNote: '',
          fee: emptyFee(category),
          licenceNo: null,
          issuedAt: null,
          validFrom: null,
          validUntil: null,
          parentId: null,
          supersededBy: null,
          qrPayload: null,
          events: [event(next, 'Application submitted', `${id} was saved in this browser. It is not filed with an office.`)],
          createdAt: now,
          updatedAt: now,
        }
        set({ seq, cases: [row, ...get().cases] })
        return { ok: true, id }
      },
      createFollowUp: (actor, parentId, kind, input, party) => {
        const parent = get().cases.find((row) => row.id === parentId)
        if (!parent) return fail('That demonstration licence is not in this browser.')
        if (parent.status !== 'issued' || parent.supersededBy) return fail('Renew or modify a current demonstration licence.')
        if (!owns(actor, parent) && licenceDesk(actor.roleId) !== 'officer') return fail('This demonstration step belongs to another desk.')
        if (get().cases.some((row) => row.parentId === parentId && row.status !== 'rejected' && row.status !== 'issued')) {
          return fail('An open follow-up is already on file for this demonstration licence.')
        }
        const error = validateLicenceInput(input, party)
        if (error) return fail(error.message)
        const { seq, next } = takeSeq(get().seq)
        const id = `DEMO-APP-${next}`
        const now = stamp()
        const row: LicenceCase = {
          ...parent,
          id,
          kind,
          status: 'submitted',
          partyId: party.id,
          ownerAccountId: parent.ownerAccountId,
          applicantLabel: input.applicantLabel.trim(),
          area: input.area.trim(),
          phone: input.phone.trim(),
          email: input.email.trim(),
          businessName: input.businessName.trim(),
          businessArea: input.businessArea.trim(),
          registrationNo: input.registrationNo.trim(),
          taxId: input.taxId.trim(),
          documents: input.documents,
          checklist: {
            identity: 'pending',
            registration: 'pending',
            tax: 'pending',
            additional: 'pending',
            formComplete: 'pending',
            documentsAttached: 'pending',
            remarks: '',
          },
          officerNote: '',
          managerNote: '',
          clarificationNote: '',
          clarificationFrom: '',
          rejectionNote: '',
          fee: emptyFee(parent.category),
          licenceNo: null,
          issuedAt: null,
          validFrom: null,
          validUntil: null,
          parentId,
          supersededBy: null,
          qrPayload: null,
          events: [event(next, kind === 'renewal' ? 'Renewal submitted' : 'Modification submitted', `${id} follows ${parent.licenceNo ?? parent.id}. It is still a simulation.`)],
          createdAt: now,
          updatedAt: now,
        }
        set({ seq, cases: [row, ...get().cases] })
        return { ok: true, id }
      },
      resubmit: (actor, id, note, input) => {
        const current = get().cases.find((row) => row.id === id)
        if (!current) return fail('That demonstration application is not in this browser.')
        if (current.status !== 'clarification-required') return fail('This case is not waiting for a clarification.')
        if (!owns(actor, current)) return fail('Only the applicant desk can answer this clarification.')
        if (note.trim().length < 8) return fail('Add a short demonstration reply.')
        const { seq, next } = takeSeq(get().seq)
        const status = current.clarificationFrom === 'manager' ? 'pending-approval' : 'under-verification'
        const now = stamp()
        set({
          seq,
          cases: patch(get().cases, id, {
            ...current,
            ...input,
            applicantLabel: input.applicantLabel.trim(),
            area: input.area.trim(),
            phone: input.phone.trim(),
            email: input.email.trim(),
            businessName: input.businessName.trim(),
            businessArea: input.businessArea.trim(),
            registrationNo: input.registrationNo.trim(),
            taxId: input.taxId.trim(),
            status,
            clarificationFrom: '',
            updatedAt: now,
            events: [event(next, 'Clarification answered', note.trim()), ...current.events],
          }),
        })
        return { ok: true, id }
      },
      startVerification: (actor, id) => {
        const denied = guard(actor, ['officer'])
        if (denied) return fail(denied)
        const current = get().cases.find((row) => row.id === id)
        if (!current || current.status !== 'submitted') return fail('Only a submitted application can move under verification.')
        const { seq, next } = takeSeq(get().seq)
        set({
          seq,
          cases: patch(get().cases, id, {
            ...current,
            status: 'under-verification',
            updatedAt: stamp(),
            events: [event(next, 'Under verification', 'The Licence Officer desk started the demonstration checklist.'), ...current.events],
          }),
        })
        return { ok: true, id }
      },
      forwardToManager: (actor, id, checklist) => {
        const denied = guard(actor, ['officer'])
        if (denied) return fail(denied)
        const current = get().cases.find((row) => row.id === id)
        if (!current || current.status !== 'under-verification') return fail('Forward a case that is under verification.')
        const blocked = checklistBlock(checklist, current.documents.some((document) => document.slot === 'additional'))
        if (blocked) return fail(blocked)
        const { seq, next } = takeSeq(get().seq)
        set({
          seq,
          cases: patch(get().cases, id, {
            ...current,
            status: 'pending-approval',
            checklist,
            officerNote: checklist.remarks,
            updatedAt: stamp(),
            events: [event(next, 'Pending manager approval', 'The demonstration checklist was marked pass.'), ...current.events],
          }),
        })
        return { ok: true, id }
      },
      requestClarification: (actor, id, note) => {
        const desk = licenceDesk(actor.roleId)
        const current = get().cases.find((row) => row.id === id)
        if (!current) return fail('That demonstration application is not in this browser.')
        const fromOfficer = current.status === 'under-verification' && (desk === 'officer' || desk === 'oversight')
        const fromManager = current.status === 'pending-approval' && (desk === 'manager' || desk === 'oversight')
        if (!fromOfficer && !fromManager) return fail('Clarification can be requested during verification or manager review.')
        if (note.trim().length < 8) return fail('Write what the demonstration file should clarify.')
        const { seq, next } = takeSeq(get().seq)
        set({
          seq,
          cases: patch(get().cases, id, {
            ...current,
            status: 'clarification-required',
            clarificationFrom: fromManager ? 'manager' : 'officer',
            clarificationNote: note.trim(),
            updatedAt: stamp(),
            events: [event(next, 'Clarification required', note.trim()), ...current.events],
          }),
        })
        return { ok: true, id }
      },
      rejectCase: (actor, id, note) => {
        const desk = licenceDesk(actor.roleId)
        const current = get().cases.find((row) => row.id === id)
        if (!current) return fail('That demonstration application is not in this browser.')
        const officerStep = current.status === 'under-verification' && (desk === 'officer' || desk === 'oversight')
        const managerStep = current.status === 'pending-approval' && (desk === 'manager' || desk === 'oversight')
        if (!officerStep && !managerStep) return fail('Reject a case during verification or manager review.')
        if (note.trim().length < 8) return fail('Add a demonstration reason.')
        const { seq, next } = takeSeq(get().seq)
        set({
          seq,
          cases: patch(get().cases, id, {
            ...current,
            status: 'rejected',
            rejectionNote: note.trim(),
            updatedAt: stamp(),
            events: [event(next, 'Rejected', note.trim()), ...current.events],
          }),
        })
        return { ok: true, id }
      },
      approveCase: (actor, id, note) => {
        const denied = guard(actor, ['manager'])
        if (denied) return fail(denied)
        const current = get().cases.find((row) => row.id === id)
        if (!current || current.status !== 'pending-approval') return fail('Approve a case that is pending manager approval.')
        const { seq, next } = takeSeq(get().seq)
        set({
          seq,
          cases: patch(get().cases, id, {
            ...current,
            status: 'approved',
            managerNote: note.trim(),
            updatedAt: stamp(),
            events: [event(next, 'Approved', note.trim() || 'Approved on the demonstration desk. No authority is granted.'), ...current.events],
          }),
        })
        return { ok: true, id }
      },
      recordFee: (actor, id, method) => {
        const denied = guard(actor, ['accounts'])
        if (denied) return fail(denied)
        const current = get().cases.find((row) => row.id === id)
        if (!current || current.status !== 'approved') return fail('Record a receipt only after demonstration approval.')
        const { seq, next } = takeSeq(get().seq)
        const now = stamp()
        set({
          seq,
          cases: patch(get().cases, id, {
            ...current,
            status: 'fee-recorded',
            fee: { ...current.fee, method, receiptId: `DEMO-RCT-${next}`, recordedAt: now },
            updatedAt: now,
            events: [event(next, 'Fee and deposit recorded', `DEMO-RCT-${next} notes the sample fee and deposit. No money was collected.`), ...current.events],
          }),
        })
        return { ok: true, id }
      },
      issueLicence: (actor, id) => {
        const denied = guard(actor, ['officer'])
        if (denied) return fail(denied)
        const current = get().cases.find((row) => row.id === id)
        if (!current || current.status !== 'fee-recorded') return fail('Issue a licence only after the sample receipt is on file.')
        const parent = current.parentId ? get().cases.find((row) => row.id === current.parentId) ?? null : null
        const { seq, next } = takeSeq(get().seq)
        const prefix = current.category === 'vendor' ? 'FS' : current.category === 'trader' ? 'AD' : 'BY'
        const licenceNo = `DEMO-LIC-${prefix}-${next}`
        const dates = validityFor(current.kind, parent)
        const now = stamp()
        const issued: LicenceCase = {
          ...current,
          status: 'issued',
          licenceNo,
          issuedAt: now,
          validFrom: dates.validFrom,
          validUntil: dates.validUntil,
          qrPayload: `DEMO|NAGA-MANDI|${licenceNo}|not-a-permit`,
          updatedAt: now,
          events: [event(next, 'Licence issued', `${licenceNo} was generated in this browser. It is not a permit.`), ...current.events],
        }
        set({
          seq,
          cases: get().cases.map((row) => {
            if (row.id === id) return issued
            if (parent && row.id === parent.id) return { ...row, supersededBy: id, updatedAt: now }
            return row
          }),
        })
        return { ok: true, id }
      },
    }),
    {
      name: storageKeys.licences,
      version: 1,
      partialize: (state) => ({ cases: state.cases, seq: state.seq }),
      onRehydrateStorage: () => (state) => {
        state?.setReady()
      },
    },
  ),
)

if (useLicenceStore.persist.hasHydrated()) {
  useLicenceStore.getState().setReady()
}

useLicenceStore.persist.onFinishHydration(() => {
  useLicenceStore.getState().setReady()
})
