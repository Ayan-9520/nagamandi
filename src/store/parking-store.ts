import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createParkingSeed } from '@/mocks/parking-seed'
import { rupeeTextToPaise } from '@/services/money'
import {
  canDecideParking,
  canEnter,
  canOperateParking,
  canReserve,
  FEE_PAISE_PER_HOUR,
  hoursText,
  issuedOffice,
  issuedYard,
  liveOffice,
  liveYard,
  NEXT_AGREEMENT,
  plateText,
} from '@/services/parking-rules'
import { storageKeys } from '@/services/storage'
import { useRegistryStore } from '@/store/registry-store'
import type { RoleId } from '@/types/access'
import type { AgreementStatus, Charge, OfficeLease, ParkingContract, ParkingSave, Visit } from '@/types/parking'

export interface ParkingActor {
  roleId: RoleId
  accountId: string
}

interface ParkingState extends ReturnType<typeof createParkingSeed> {
  ready: boolean
  setReady: () => void
  resetParking: () => void
  fileParkingContract: (actor: ParkingActor, input: { operatorId: string; yardId: string; experience: string; start: string; end: string }) => ParkingSave
  moveParkingContract: (actor: ParkingActor, id: string, next: AgreementStatus) => ParkingSave
  recordParkingDeposit: (actor: ParkingActor, id: string, rupees: string) => ParkingSave
  registerVehicle: (actor: ParkingActor, input: { transporterId: string; plate: string; note: string }) => ParkingSave
  reserveSlot: (actor: ParkingActor, input: { vehicleId: string; slotId: string }) => ParkingSave
  enterVehicle: (actor: ParkingActor, input: { vehicleId: string; slotId: string }) => ParkingSave
  exitVehicle: (actor: ParkingActor, input: { visitId: string; hours: string }) => ParkingSave
  fileOfficeLease: (actor: ParkingActor, input: { lesseeId: string; officeId: string; purpose: string; start: string; end: string }) => ParkingSave
  moveOfficeLease: (actor: ParkingActor, id: string, next: AgreementStatus) => ParkingSave
  recordOfficeDeposit: (actor: ParkingActor, id: string, rupees: string) => ParkingSave
  recordRent: (actor: ParkingActor, id: string, rupees: string) => ParkingSave
}

function stamp() {
  return new Date().toISOString()
}

function fail(message: string): ParkingSave {
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

export const useParkingStore = create<ParkingState>()(
  persist(
    (set, get) => ({
      ...createParkingSeed(),
      ready: false,
      setReady: () => set({ ready: true }),
      resetParking: () => set({ ...createParkingSeed(), ready: true }),
      fileParkingContract: (actor, input) => {
        if (!canOperateParking(actor.roleId)) return fail('This demonstration desk cannot file a parking application.')
        const yard = get().yards.find((row) => row.id === input.yardId)
        if (!yard) return fail('Choose a yard from this browser.')
        if (liveYard(get().contracts, yard.id)) return fail('That yard already has an open simulated contract.')
        const operator = useRegistryStore.getState().parties.find((row) => row.id === input.operatorId && row.kind === 'transporter' && row.status === 'Active')
        if (!operator) return fail('Choose an active transporter desk code.')
        if (input.experience.trim().length < 8) return fail('Describe the proposed operations in at least 8 characters.')
        if (!dateOk(input.start) || !dateOk(input.end) || input.end <= input.start) return fail('The contract end date must fall after the start date.')
        const seq = get().contractSeq
        const now = stamp()
        const contract: ParkingContract = {
          id: `DEMO-PKC-${seq}`,
          contractNo: `DEMO-PKC-${seq}`,
          mandiId: yard.mandiId,
          yardId: yard.id,
          yardCode: yard.code,
          operatorId: operator.id,
          operatorLabel: operator.label,
          experience: input.experience.trim(),
          status: 'submitted',
          depositPaise: 0,
          receiptId: '',
          start: input.start,
          end: input.end,
          history: [{ at: now, status: 'submitted', note: 'Application filed in this browser. No fee was taken.' }],
          createdAt: now,
          updatedAt: now,
        }
        set({ contractSeq: seq + 1, contracts: [contract, ...get().contracts] })
        return { ok: true, id: contract.id }
      },
      moveParkingContract: (actor, id, next) => {
        const current = get().contracts.find((row) => row.id === id)
        if (!current) return fail('That contract is not in this browser.')
        const applicantStep = next === 'submitted' && (current.status === 'draft' || current.status === 'clarification-required')
        if (applicantStep && !canOperateParking(actor.roleId)) return fail('This demonstration desk cannot move the application.')
        if (!applicantStep && !canDecideParking(actor.roleId)) return fail('A Mandi official desk records verification, approval and issue.')
        if (!NEXT_AGREEMENT[current.status].includes(next)) return fail(`A contract marked ${current.status} cannot move to ${next}.`)
        if (next === 'issued' && issuedYard(get().contracts, current.yardId)) return fail('That yard is already allocated on an issued contract.')
        if (next === 'issued' && !current.receiptId) return fail('Record the simulated deposit before the contract is issued.')
        const now = stamp()
        set({
          contracts: get().contracts.map((row) =>
            row.id === id
              ? { ...row, status: next, updatedAt: now, history: [...row.history, { at: now, status: next, note: 'Simulated step. No deed was signed.' }] }
              : row,
          ),
        })
        return { ok: true, id }
      },
      recordParkingDeposit: (actor, id, rupees) => {
        if (!canDecideParking(actor.roleId)) return fail('A Mandi official desk records the simulated deposit.')
        const current = get().contracts.find((row) => row.id === id)
        if (!current) return fail('That contract is not in this browser.')
        if (current.status !== 'approved') return fail('Approve the contract before the simulated deposit.')
        if (current.receiptId) return fail('A simulated deposit receipt is already on this contract.')
        const paise = amount(rupees)
        if (paise === null) return fail('Enter a deposit above zero, with at most two decimal places.')
        const seq = get().chargeSeq
        const receiptId = `DEMO-PK-RCT-${seq}`
        const now = stamp()
        const charge: Charge = {
          id: `DEMO-PKN-${seq}`,
          kind: 'deposit',
          sourceNo: current.contractNo,
          placeCode: current.yardCode,
          partyLabel: current.operatorLabel,
          paise,
          note: `${receiptId} is a simulated deposit. No money moved.`,
          at: now,
        }
        set({
          chargeSeq: seq + 1,
          charges: [charge, ...get().charges],
          contracts: get().contracts.map((row) =>
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
      registerVehicle: (actor, input) => {
        if (!canOperateParking(actor.roleId)) return fail('This demonstration desk cannot register a vehicle.')
        const plate = plateText(input.plate)
        if (!plate) return fail('Enter a vehicle number of 6 to 16 letters, digits or hyphens.')
        if (get().vehicles.some((row) => row.vehicleNo === plate)) return fail('That vehicle number is already in this parking book.')
        const transporter = useRegistryStore.getState().parties.find((row) => row.id === input.transporterId && row.kind === 'transporter' && row.status === 'Active')
        if (!transporter) return fail('Choose an active transporter desk code.')
        const seq = get().vehicleSeq
        const vehicle = {
          id: `DEMO-PKH-${seq}`,
          vehicleNo: plate,
          transporterId: transporter.id,
          transporterLabel: transporter.label,
          note: input.note.trim() || 'Simulated registration. Not a permit.',
        }
        set({ vehicleSeq: seq + 1, vehicles: [vehicle, ...get().vehicles] })
        return { ok: true, id: vehicle.id }
      },
      reserveSlot: (actor, input) => {
        if (!canOperateParking(actor.roleId)) return fail('This demonstration desk cannot reserve a slot.')
        const slot = get().slots.find((row) => row.id === input.slotId)
        const yard = slot ? get().yards.find((row) => row.id === slot.yardId) : undefined
        const vehicle = get().vehicles.find((row) => row.id === input.vehicleId)
        if (!slot || !yard) return fail('Choose a slot from this browser.')
        if (!vehicle) return fail('Choose a registered vehicle.')
        const reason = canReserve(get().visits, get().contracts, yard, slot.id, vehicle.id)
        if (reason) return fail(reason)
        const seq = get().visitSeq
        const visit: Visit = {
          id: `DEMO-PKV-${seq}`,
          visitNo: `DEMO-PKV-${seq}`,
          vehicleId: vehicle.id,
          vehicleNo: vehicle.vehicleNo,
          transporterId: vehicle.transporterId,
          transporterLabel: vehicle.transporterLabel,
          yardId: yard.id,
          yardCode: yard.code,
          slotId: slot.id,
          slotCode: slot.code,
          status: 'reserved',
          passNo: '',
          enteredAt: '',
          exitedAt: '',
          hours: 0,
          feePaise: 0,
          note: 'Simulated reservation. The slot is not occupied.',
        }
        set({ visitSeq: seq + 1, visits: [visit, ...get().visits] })
        return { ok: true, id: visit.id }
      },
      enterVehicle: (actor, input) => {
        if (!canOperateParking(actor.roleId)) return fail('This demonstration desk cannot record an entry.')
        const slot = get().slots.find((row) => row.id === input.slotId)
        const yard = slot ? get().yards.find((row) => row.id === slot.yardId) : undefined
        const vehicle = get().vehicles.find((row) => row.id === input.vehicleId)
        if (!slot || !yard) return fail('Choose a slot from this browser.')
        if (!vehicle) return fail('Choose a registered vehicle.')
        const reason = canEnter(get().visits, get().contracts, yard, slot.id, vehicle.id)
        if (reason) return fail(reason)
        const now = stamp()
        const seq = get().visitSeq
        const passNo = `DEMO-PKP-${seq}`
        const reserved = get().visits.find((row) => row.vehicleId === vehicle.id && row.status === 'reserved')
        if (reserved) {
          set({
            visitSeq: seq + 1,
            visits: get().visits.map((row) =>
              row.id === reserved.id
                ? { ...row, status: 'inside' as const, passNo, enteredAt: now, note: 'Simulated entry. The pass is not a gate pass.' }
                : row,
            ),
          })
          return { ok: true, id: passNo }
        }
        const visit: Visit = {
          id: `DEMO-PKV-${seq}`,
          visitNo: `DEMO-PKV-${seq}`,
          vehicleId: vehicle.id,
          vehicleNo: vehicle.vehicleNo,
          transporterId: vehicle.transporterId,
          transporterLabel: vehicle.transporterLabel,
          yardId: yard.id,
          yardCode: yard.code,
          slotId: slot.id,
          slotCode: slot.code,
          status: 'inside',
          passNo,
          enteredAt: now,
          exitedAt: '',
          hours: 0,
          feePaise: 0,
          note: 'Simulated entry. The pass is not a gate pass.',
        }
        set({ visitSeq: seq + 1, visits: [visit, ...get().visits] })
        return { ok: true, id: passNo }
      },
      exitVehicle: (actor, input) => {
        if (!canOperateParking(actor.roleId)) return fail('This demonstration desk cannot record an exit.')
        const current = get().visits.find((row) => row.id === input.visitId)
        if (!current) return fail('That visit is not in this browser.')
        if (current.status !== 'inside') return fail('Only a vehicle that is inside can exit.')
        const hours = hoursText(input.hours)
        if (hours === null) return fail('Enter whole hours from 1 to 48.')
        const now = stamp()
        set({
          visits: get().visits.map((row) =>
            row.id === current.id
              ? { ...row, status: 'exited' as const, exitedAt: now, hours, feePaise: hours * FEE_PAISE_PER_HOUR, note: 'Simulated exit. The fee was not collected.' }
              : row,
          ),
        })
        return { ok: true, id: current.id }
      },
      fileOfficeLease: (actor, input) => {
        if (!canOperateParking(actor.roleId)) return fail('This demonstration desk cannot file an office application.')
        const office = get().offices.find((row) => row.id === input.officeId)
        if (!office) return fail('Choose an office from this browser.')
        if (liveOffice(get().leases, office.id)) return fail('That office already has an open simulated lease.')
        const lessee = useRegistryStore.getState().parties.find((row) => row.id === input.lesseeId && row.kind === 'transporter' && row.status === 'Active')
        if (!lessee) return fail('Choose an active transporter desk code.')
        if (input.purpose.trim().length < 8) return fail('Describe the proposed use in at least 8 characters.')
        if (!dateOk(input.start) || !dateOk(input.end) || input.end <= input.start) return fail('The lease end date must fall after the start date.')
        const seq = get().leaseSeq
        const now = stamp()
        const lease: OfficeLease = {
          id: `DEMO-TOL-${seq}`,
          leaseNo: `DEMO-TOL-${seq}`,
          mandiId: office.mandiId,
          officeId: office.id,
          officeCode: office.code,
          lesseeId: lessee.id,
          lesseeLabel: lessee.label,
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
      moveOfficeLease: (actor, id, next) => {
        const current = get().leases.find((row) => row.id === id)
        if (!current) return fail('That lease is not in this browser.')
        const applicantStep = next === 'submitted' && (current.status === 'draft' || current.status === 'clarification-required')
        if (applicantStep && !canOperateParking(actor.roleId)) return fail('This demonstration desk cannot move the application.')
        if (!applicantStep && !canDecideParking(actor.roleId)) return fail('A Mandi official desk records verification, approval and allotment.')
        if (!NEXT_AGREEMENT[current.status].includes(next)) return fail(`A lease marked ${current.status} cannot move to ${next}.`)
        if (next === 'issued' && issuedOffice(get().leases, current.officeId)) return fail('That office is already allotted on an issued lease.')
        if (next === 'issued' && !current.receiptId) return fail('Record the simulated deposit before the office is allotted.')
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
      recordOfficeDeposit: (actor, id, rupees) => {
        if (!canDecideParking(actor.roleId)) return fail('A Mandi official desk records the simulated deposit.')
        const current = get().leases.find((row) => row.id === id)
        if (!current) return fail('That lease is not in this browser.')
        if (current.status !== 'approved') return fail('Approve the lease before the simulated deposit.')
        if (current.receiptId) return fail('A simulated deposit receipt is already on this lease.')
        const paise = amount(rupees)
        if (paise === null) return fail('Enter a deposit above zero, with at most two decimal places.')
        const seq = get().chargeSeq
        const receiptId = `DEMO-TO-RCT-${seq}`
        const now = stamp()
        const charge: Charge = {
          id: `DEMO-PKN-${seq}`,
          kind: 'deposit',
          sourceNo: current.leaseNo,
          placeCode: current.officeCode,
          partyLabel: current.lesseeLabel,
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
        if (!canDecideParking(actor.roleId)) return fail('A Mandi official desk records simulated rent.')
        const current = get().leases.find((row) => row.id === id)
        if (!current) return fail('That lease is not in this browser.')
        if (current.status !== 'issued') return fail('Allot the office before simulated rent is noted.')
        const paise = amount(rupees)
        if (paise === null) return fail('Enter rent above zero, with at most two decimal places.')
        const seq = get().chargeSeq
        const now = stamp()
        const charge: Charge = {
          id: `DEMO-TOR-${seq}`,
          kind: 'rent',
          sourceNo: current.leaseNo,
          placeCode: current.officeCode,
          partyLabel: current.lesseeLabel,
          paise,
          note: 'Simulated rent. Not a demand and not a collection.',
          at: now,
        }
        set({ chargeSeq: seq + 1, charges: [charge, ...get().charges] })
        return { ok: true, id: charge.id }
      },
    }),
    {
      name: storageKeys.parking,
      version: 1,
      partialize: (state) => ({
        yards: state.yards,
        offices: state.offices,
        slots: state.slots,
        contracts: state.contracts,
        leases: state.leases,
        vehicles: state.vehicles,
        visits: state.visits,
        charges: state.charges,
        contractSeq: state.contractSeq,
        leaseSeq: state.leaseSeq,
        vehicleSeq: state.vehicleSeq,
        visitSeq: state.visitSeq,
        chargeSeq: state.chargeSeq,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setReady()
      },
    },
  ),
)

if (useParkingStore.persist.hasHydrated()) {
  useParkingStore.getState().setReady()
}

useParkingStore.persist.onFinishHydration(() => {
  useParkingStore.getState().setReady()
})
