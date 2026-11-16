import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createFacilitySeed } from '@/mocks/facility-seed'
import { rupeeTextToPaise } from '@/services/money'
import {
  canDecideFacility,
  canOperateFacility,
  canStay,
  FACILITY_TEMPLATES,
  guestText,
  issuedSite,
  liveSite,
  nightsText,
  NEXT_AGREEMENT,
} from '@/services/facility-rules'
import { storageKeys } from '@/services/storage'
import { useRegistryStore } from '@/store/registry-store'
import type { RoleId } from '@/types/access'
import type { AgreementStatus, Charge, CheckItem, CheckKind, FacilityKind, FacilityLease, FacilitySave, InsuranceRecord, MaintenanceLog, Stay } from '@/types/facility'

export interface FacilityActor {
  roleId: RoleId
  accountId: string
}

interface FacilityState extends ReturnType<typeof createFacilitySeed> {
  ready: boolean
  setReady: () => void
  resetFacilities: () => void
  fileLease: (actor: FacilityActor, input: { kind: FacilityKind; siteId: string; operatorId: string; purpose: string; start: string; end: string }) => FacilitySave
  moveLease: (actor: FacilityActor, id: string, next: AgreementStatus) => FacilitySave
  recordDeposit: (actor: FacilityActor, id: string, rupees: string) => FacilitySave
  recordRent: (actor: FacilityActor, id: string, rupees: string) => FacilitySave
  renewLease: (actor: FacilityActor, id: string, end: string) => FacilitySave
  fileStay: (actor: FacilityActor, input: { unitId: string; guest: string; nights: string }) => FacilitySave
  closeStay: (actor: FacilityActor, id: string) => FacilitySave
  fileInspection: (actor: FacilityActor, input: { kind: CheckKind; siteId: string; items: CheckItem[]; note: string }) => FacilitySave
  fileMaintenance: (actor: FacilityActor, input: { siteId: string; title: string; note: string }) => FacilitySave
  closeMaintenance: (actor: FacilityActor, id: string) => FacilitySave
  fileInsurance: (actor: FacilityActor, input: { siteId: string; cover: string; until: string }) => FacilitySave
}

function stamp() {
  return new Date().toISOString()
}

function fail(message: string): FacilitySave {
  return { ok: false, message }
}

function dateOk(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function amount(text: string) {
  const paise = rupeeTextToPaise(text)
  if (paise === null || paise <= 0) return null
  return paise
}

export const useFacilityStore = create<FacilityState>()(
  persist(
    (set, get) => ({
      ...createFacilitySeed(),
      ready: false,
      setReady: () => set({ ready: true }),
      resetFacilities: () => set({ ...createFacilitySeed(), ready: true }),
      fileLease: (actor, input) => {
        if (!canOperateFacility(actor.roleId)) return fail('This demonstration desk cannot file a facility application.')
        const site = get().sites.find((row) => row.id === input.siteId && row.kind === input.kind)
        if (!site) return fail('Choose a site of this facility type.')
        if (liveSite(get().leases, site.id)) return fail('That site already has an open simulated lease.')
        const operator = useRegistryStore.getState().parties.find((row) => row.id === input.operatorId && row.kind === 'facility-operator' && row.status === 'Active')
        if (!operator) return fail('Choose an active facility desk code.')
        if (input.purpose.trim().length < 8) return fail('Describe the proposed use in at least 8 characters.')
        if (!dateOk(input.start) || !dateOk(input.end) || input.end <= input.start) return fail('The lease end date must fall after the start date.')
        const seq = get().leaseSeq
        const now = stamp()
        const lease: FacilityLease = {
          id: `DEMO-FCL-${seq}`,
          leaseNo: `DEMO-FCL-${seq}`,
          mandiId: site.mandiId,
          kind: site.kind,
          siteId: site.id,
          siteCode: site.code,
          operatorId: operator.id,
          operatorLabel: operator.label,
          purpose: input.purpose.trim(),
          status: 'submitted',
          depositPaise: 0,
          receiptId: '',
          start: input.start,
          end: input.end,
          history: [{ at: now, status: 'submitted', note: 'Application filed in this browser. No fee was taken.' }],
          createdAt: now,
          updatedAt: now,
        }
        set({ leaseSeq: seq + 1, leases: [lease, ...get().leases] })
        return { ok: true, id: lease.id }
      },
      moveLease: (actor, id, next) => {
        const current = get().leases.find((row) => row.id === id)
        if (!current) return fail('That lease is not in this browser.')
        const applicantStep = next === 'submitted' && (current.status === 'draft' || current.status === 'clarification-required')
        if (applicantStep && !canOperateFacility(actor.roleId)) return fail('This demonstration desk cannot move the application.')
        if (!applicantStep && !canDecideFacility(actor.roleId)) return fail('A Mandi official desk records verification, approval and issue.')
        if (!NEXT_AGREEMENT[current.status].includes(next)) return fail(`A lease marked ${current.status} cannot move to ${next}.`)
        if (next === 'issued' && issuedSite(get().leases, current.siteId)) return fail('That site is already allotted on an issued lease.')
        if (next === 'issued' && !current.receiptId) return fail('Record the simulated deposit before the lease is issued.')
        const now = stamp()
        set({
          leases: get().leases.map((row) =>
            row.id === id
              ? { ...row, status: next, updatedAt: now, history: [...row.history, { at: now, status: next, note: 'Simulated step. No deed was signed.' }] }
              : row,
          ),
        })
        return { ok: true, id }
      },
      recordDeposit: (actor, id, rupees) => {
        if (!canDecideFacility(actor.roleId)) return fail('A Mandi official desk records the simulated deposit.')
        const current = get().leases.find((row) => row.id === id)
        if (!current) return fail('That lease is not in this browser.')
        if (current.status !== 'approved') return fail('Approve the lease before the simulated deposit.')
        if (current.receiptId) return fail('A simulated deposit receipt is already on this lease.')
        const paise = amount(rupees)
        if (paise === null) return fail('Enter a deposit above zero, with at most two decimal places.')
        const seq = get().chargeSeq
        const receiptId = `DEMO-FC-RCT-${seq}`
        const now = stamp()
        const charge: Charge = {
          id: `DEMO-FCN-${seq}`,
          kind: 'deposit',
          sourceNo: current.leaseNo,
          placeCode: current.siteCode,
          partyLabel: current.operatorLabel,
          paise,
          note: `${receiptId} is a simulated deposit. No money moved.`,
          at: now,
        }
        set({
          chargeSeq: seq + 1,
          charges: [charge, ...get().charges],
          leases: get().leases.map((row) =>
            row.id === id
              ? {
                  ...row,
                  status: 'deposit-recorded',
                  depositPaise: paise,
                  receiptId,
                  updatedAt: now,
                  history: [...row.history, { at: now, status: 'deposit-recorded' as const, note: charge.note }],
                }
              : row,
          ),
        })
        return { ok: true, id: receiptId }
      },
      recordRent: (actor, id, rupees) => {
        if (!canDecideFacility(actor.roleId)) return fail('A Mandi official desk records simulated rent.')
        const current = get().leases.find((row) => row.id === id)
        if (!current) return fail('That lease is not in this browser.')
        if (current.status !== 'issued') return fail('Issue the lease before simulated rent is noted.')
        const paise = amount(rupees)
        if (paise === null) return fail('Enter rent above zero, with at most two decimal places.')
        const seq = get().chargeSeq
        const now = stamp()
        const charge: Charge = {
          id: `DEMO-FCR-${seq}`,
          kind: 'rent',
          sourceNo: current.leaseNo,
          placeCode: current.siteCode,
          partyLabel: current.operatorLabel,
          paise,
          note: 'Simulated rent. Not a demand and not a collection.',
          at: now,
        }
        set({ chargeSeq: seq + 1, charges: [charge, ...get().charges] })
        return { ok: true, id: charge.id }
      },
      renewLease: (actor, id, end) => {
        if (!canDecideFacility(actor.roleId)) return fail('A Mandi official desk records a simulated renewal.')
        const current = get().leases.find((row) => row.id === id)
        if (!current) return fail('That lease is not in this browser.')
        if (current.status !== 'issued') return fail('Renew only an issued lease.')
        if (!dateOk(end) || end <= current.end) return fail('The new end date must fall after the current end.')
        const now = stamp()
        set({
          leases: get().leases.map((row) =>
            row.id === id
              ? { ...row, end, updatedAt: now, history: [...row.history, { at: now, status: 'issued' as const, note: `Renewed in this browser through ${end}. No deed was signed.` }] }
              : row,
          ),
        })
        return { ok: true, id }
      },
      fileStay: (actor, input) => {
        if (!canOperateFacility(actor.roleId)) return fail('This demonstration desk cannot record a stay.')
        const unit = get().units.find((row) => row.id === input.unitId)
        const site = unit ? get().sites.find((row) => row.id === unit.siteId) : undefined
        if (!unit || !site) return fail('Choose a unit from this browser.')
        const guest = guestText(input.guest)
        if (!guest) return fail('Use a fictional guest desk code such as GS-21.')
        const nights = nightsText(input.nights)
        if (nights === null) return fail('Enter a whole count from 1 to 30.')
        const reason = canStay(get().stays, get().leases, site.id, unit.id)
        if (reason) return fail(reason)
        const seq = get().staySeq
        const stay: Stay = {
          id: `DEMO-FST-${seq}`,
          stayNo: `DEMO-FST-${seq}`,
          siteId: site.id,
          siteCode: site.code,
          unitId: unit.id,
          unitCode: unit.code,
          guestCode: guest,
          nights,
          status: 'open',
          note: 'Simulated stay. The guest code is fictional.',
        }
        set({ staySeq: seq + 1, stays: [stay, ...get().stays] })
        return { ok: true, id: stay.id }
      },
      closeStay: (actor, id) => {
        if (!canOperateFacility(actor.roleId)) return fail('This demonstration desk cannot close a stay.')
        const current = get().stays.find((row) => row.id === id)
        if (!current) return fail('That stay is not in this browser.')
        if (current.status === 'closed') return fail('This stay is already closed.')
        set({ stays: get().stays.map((row) => (row.id === id ? { ...row, status: 'closed' } : row)) })
        return { ok: true, id }
      },
      fileInspection: (actor, input) => {
        if (!canOperateFacility(actor.roleId)) return fail('This demonstration desk cannot file a checklist.')
        const site = get().sites.find((row) => row.id === input.siteId)
        if (!site) return fail('Choose a site from this browser.')
        if (!FACILITY_TEMPLATES[site.kind].checks.includes(input.kind)) return fail('That checklist belongs to another facility template.')
        if (!issuedSite(get().leases, site.id)) return fail('File the checklist on a site with an issued lease.')
        if (input.items.length === 0 || input.items.some((item) => item.result !== 'yes' && item.result !== 'no')) {
          return fail('Mark every checklist line yes or no.')
        }
        if (input.items.some((item) => item.result === 'no') && input.note.trim().length < 8) {
          return fail('A failed line needs a note of at least 8 characters.')
        }
        const seq = get().inspectionSeq
        const row = {
          id: `DEMO-FCK-${seq}`,
          kind: input.kind,
          siteId: site.id,
          siteCode: site.code,
          items: input.items,
          note: input.note.trim() || 'Simulated checklist. No inspection was sent outside this browser.',
          at: stamp(),
        }
        set({ inspectionSeq: seq + 1, inspections: [row, ...get().inspections] })
        return { ok: true, id: row.id }
      },
      fileMaintenance: (actor, input) => {
        if (!canOperateFacility(actor.roleId)) return fail('This demonstration desk cannot open a maintenance log.')
        const site = get().sites.find((row) => row.id === input.siteId)
        if (!site) return fail('Choose a site from this browser.')
        if (input.title.trim().length < 4) return fail('Give the log a short title.')
        if (input.note.trim().length < 8) return fail('Describe the note in at least 8 characters.')
        const seq = get().maintenanceSeq
        const row: MaintenanceLog = {
          id: `DEMO-FCM-${seq}`,
          siteId: site.id,
          siteCode: site.code,
          title: input.title.trim(),
          status: 'open',
          note: input.note.trim(),
          at: stamp(),
        }
        set({ maintenanceSeq: seq + 1, maintenance: [row, ...get().maintenance] })
        return { ok: true, id: row.id }
      },
      closeMaintenance: (actor, id) => {
        if (!canOperateFacility(actor.roleId)) return fail('This demonstration desk cannot close a log.')
        const current = get().maintenance.find((row) => row.id === id)
        if (!current) return fail('That log is not in this browser.')
        if (current.status === 'closed') return fail('This log is already closed.')
        set({ maintenance: get().maintenance.map((row) => (row.id === id ? { ...row, status: 'closed' } : row)) })
        return { ok: true, id }
      },
      fileInsurance: (actor, input) => {
        if (!canOperateFacility(actor.roleId)) return fail('This demonstration desk cannot file cover.')
        const site = get().sites.find((row) => row.id === input.siteId)
        if (!site) return fail('Choose a site from this browser.')
        if (input.cover.trim().length < 4) return fail('Name the simulated cover in at least 4 characters.')
        if (!dateOk(input.until)) return fail('Enter an end date as YYYY-MM-DD.')
        const seq = get().insuranceSeq
        const row: InsuranceRecord = {
          id: `DEMO-FCI-${seq}`,
          policyNo: `DEMO-FCI-${seq}`,
          siteId: site.id,
          siteCode: site.code,
          cover: input.cover.trim(),
          until: input.until,
          note: 'Simulated cover. No policy was bought.',
        }
        set({ insuranceSeq: seq + 1, insurance: [row, ...get().insurance] })
        return { ok: true, id: row.id }
      },
    }),
    {
      name: storageKeys.facilities,
      version: 1,
      partialize: (state) => ({
        sites: state.sites,
        units: state.units,
        leases: state.leases,
        stays: state.stays,
        charges: state.charges,
        inspections: state.inspections,
        maintenance: state.maintenance,
        insurance: state.insurance,
        leaseSeq: state.leaseSeq,
        staySeq: state.staySeq,
        chargeSeq: state.chargeSeq,
        inspectionSeq: state.inspectionSeq,
        maintenanceSeq: state.maintenanceSeq,
        insuranceSeq: state.insuranceSeq,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setReady()
      },
    },
  ),
)

if (useFacilityStore.persist.hasHydrated()) {
  useFacilityStore.getState().setReady()
}

useFacilityStore.persist.onFinishHydration(() => {
  useFacilityStore.getState().setReady()
})
