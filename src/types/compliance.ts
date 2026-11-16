export const INCIDENT_STATUSES = ['open', 'closed'] as const
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number]

export const ACTION_STATUSES = ['open', 'closed'] as const
export type ActionStatus = (typeof ACTION_STATUSES)[number]

export const INSPECTION_STATUSES = ['planned', 'done'] as const
export type InspectionStatus = (typeof INSPECTION_STATUSES)[number]

export const SOP_STATUSES = ['on-track', 'attention', 'exception'] as const
export type SopStatus = (typeof SOP_STATUSES)[number]

export interface ComplianceIncident {
  id: string
  sop: string
  title: string
  note: string
  status: IncidentStatus
  at: string
}

export interface CorrectiveAction {
  id: string
  incidentId: string
  sop: string
  title: string
  due: string
  status: ActionStatus
  note: string
}

export interface CalendarInspection {
  id: string
  sop: string
  title: string
  day: string
  status: InspectionStatus
  note: string
}

export interface AuditEntry {
  id: string
  at: string
  sop: string
  title: string
  detail: string
  label: string
}

export interface ComplianceData {
  incidents: ComplianceIncident[]
  actions: CorrectiveAction[]
  inspections: CalendarInspection[]
  audit: AuditEntry[]
  incidentSeq: number
  actionSeq: number
  inspectionSeq: number
  auditSeq: number
}

export type ComplianceSave = { ok: true; id: string } | { ok: false; message: string }
