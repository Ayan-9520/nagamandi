import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createComplianceSeed } from '@/mocks/compliance-seed'
import { AUDIT_LABEL, canPostCompliance, COMMAND_DAY, isSopNumber } from '@/services/compliance-rules'
import { storageKeys } from '@/services/storage'
import type { RoleId } from '@/types/access'
import type { ComplianceData, ComplianceSave } from '@/types/compliance'

export interface ComplianceActor {
  roleId: RoleId
  accountId: string
}

interface ComplianceState extends ComplianceData {
  ready: boolean
  setReady: () => void
  resetCompliance: () => void
  fileIncident: (actor: ComplianceActor, input: { sop: string; title: string; note: string }) => ComplianceSave
  closeIncident: (actor: ComplianceActor, id: string) => ComplianceSave
  fileAction: (actor: ComplianceActor, input: { incidentId: string; title: string; due: string; note: string }) => ComplianceSave
  closeAction: (actor: ComplianceActor, id: string) => ComplianceSave
  fileInspection: (actor: ComplianceActor, input: { sop: string; title: string; day: string; note: string }) => ComplianceSave
}

function fail(message: string): ComplianceSave {
  return { ok: false, message }
}

function dateOk(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export const useComplianceStore = create<ComplianceState>()(
  persist(
    (set, get) => ({
      ...createComplianceSeed(),
      ready: false,
      setReady: () => set({ ready: true }),
      resetCompliance: () => set({ ...createComplianceSeed(), ready: true }),
      fileIncident: (actor, input) => {
        if (!canPostCompliance(actor.roleId)) return fail('A Mandi official desk files a simulated incident.')
        if (!isSopNumber(input.sop)) return fail('Choose one of the 15 SOP numbers.')
        if (input.title.trim().length < 8) return fail('Give the incident a title of at least 8 characters.')
        if (input.note.trim().length < 8) return fail('Describe the incident in at least 8 characters.')
        const seq = get().incidentSeq
        const id = `DEMO-INC-${seq}`
        const auditSeq = get().auditSeq
        set({
          incidentSeq: seq + 1,
          auditSeq: auditSeq + 1,
          incidents: [{ id, sop: input.sop, title: input.title.trim(), note: input.note.trim(), status: 'open', at: COMMAND_DAY }, ...get().incidents],
          audit: [{
            id: `DEMO-AUD-${auditSeq}`,
            at: `${COMMAND_DAY}T15:00:00+05:30`,
            sop: input.sop,
            title: 'Incident filed',
            detail: `${id} was filed in this browser.`,
            label: AUDIT_LABEL,
          }, ...get().audit],
        })
        return { ok: true, id }
      },
      closeIncident: (actor, id) => {
        if (!canPostCompliance(actor.roleId)) return fail('A Mandi official desk closes a simulated incident.')
        const current = get().incidents.find((row) => row.id === id)
        if (!current) return fail('That incident is not in this browser.')
        if (current.status === 'closed') return fail('This incident is already closed.')
        const auditSeq = get().auditSeq
        set({
          auditSeq: auditSeq + 1,
          incidents: get().incidents.map((row) => (row.id === id ? { ...row, status: 'closed' } : row)),
          audit: [{
            id: `DEMO-AUD-${auditSeq}`,
            at: `${COMMAND_DAY}T15:10:00+05:30`,
            sop: current.sop,
            title: 'Incident closed',
            detail: `${id} was closed in this browser.`,
            label: AUDIT_LABEL,
          }, ...get().audit],
        })
        return { ok: true, id }
      },
      fileAction: (actor, input) => {
        if (!canPostCompliance(actor.roleId)) return fail('A Mandi official desk files a simulated action.')
        const incident = get().incidents.find((row) => row.id === input.incidentId)
        if (!incident) return fail('Choose an incident that is already in this browser.')
        if (input.title.trim().length < 8) return fail('Give the action a title of at least 8 characters.')
        if (!dateOk(input.due) || input.due < COMMAND_DAY) return fail('The due date must fall on or after 14 Nov 2026.')
        if (input.note.trim().length < 8) return fail('Describe the action in at least 8 characters.')
        const seq = get().actionSeq
        const id = `DEMO-CAP-${seq}`
        const auditSeq = get().auditSeq
        set({
          actionSeq: seq + 1,
          auditSeq: auditSeq + 1,
          actions: [{ id, incidentId: incident.id, sop: incident.sop, title: input.title.trim(), due: input.due, status: 'open', note: input.note.trim() }, ...get().actions],
          audit: [{
            id: `DEMO-AUD-${auditSeq}`,
            at: `${COMMAND_DAY}T15:20:00+05:30`,
            sop: incident.sop,
            title: 'Action filed',
            detail: `${id} was filed in this browser.`,
            label: AUDIT_LABEL,
          }, ...get().audit],
        })
        return { ok: true, id }
      },
      closeAction: (actor, id) => {
        if (!canPostCompliance(actor.roleId)) return fail('A Mandi official desk closes a simulated action.')
        const current = get().actions.find((row) => row.id === id)
        if (!current) return fail('That action is not in this browser.')
        if (current.status === 'closed') return fail('This action is already closed.')
        const auditSeq = get().auditSeq
        set({
          auditSeq: auditSeq + 1,
          actions: get().actions.map((row) => (row.id === id ? { ...row, status: 'closed' } : row)),
          audit: [{
            id: `DEMO-AUD-${auditSeq}`,
            at: `${COMMAND_DAY}T15:30:00+05:30`,
            sop: current.sop,
            title: 'Action closed',
            detail: `${id} was closed in this browser.`,
            label: AUDIT_LABEL,
          }, ...get().audit],
        })
        return { ok: true, id }
      },
      fileInspection: (actor, input) => {
        if (!canPostCompliance(actor.roleId)) return fail('A Mandi official desk files a simulated inspection.')
        if (!isSopNumber(input.sop)) return fail('Choose one of the 15 SOP numbers.')
        if (input.title.trim().length < 8) return fail('Give the inspection a title of at least 8 characters.')
        if (!dateOk(input.day)) return fail('Use a day in YYYY-MM-DD form.')
        if (input.note.trim().length < 8) return fail('Describe the inspection in at least 8 characters.')
        const seq = get().inspectionSeq
        const id = `DEMO-CIN-${seq}`
        const auditSeq = get().auditSeq
        set({
          inspectionSeq: seq + 1,
          auditSeq: auditSeq + 1,
          inspections: [{ id, sop: input.sop, title: input.title.trim(), day: input.day, status: 'planned', note: input.note.trim() }, ...get().inspections],
          audit: [{
            id: `DEMO-AUD-${auditSeq}`,
            at: `${COMMAND_DAY}T15:40:00+05:30`,
            sop: input.sop,
            title: 'Inspection planned',
            detail: `${id} was added to the demonstration calendar.`,
            label: AUDIT_LABEL,
          }, ...get().audit],
        })
        return { ok: true, id }
      },
    }),
    {
      name: storageKeys.compliance,
      partialize: (state) => ({
        incidents: state.incidents,
        actions: state.actions,
        inspections: state.inspections,
        audit: state.audit,
        incidentSeq: state.incidentSeq,
        actionSeq: state.actionSeq,
        inspectionSeq: state.inspectionSeq,
        auditSeq: state.auditSeq,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setReady()
      },
    },
  ),
)

if (useComplianceStore.persist.hasHydrated()) {
  useComplianceStore.getState().setReady()
}

useComplianceStore.persist.onFinishHydration(() => {
  useComplianceStore.getState().setReady()
})
