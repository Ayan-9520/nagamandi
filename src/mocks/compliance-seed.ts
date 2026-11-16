import { AUDIT_LABEL, COMMAND_DAY } from '@/services/compliance-rules'
import type { ComplianceData } from '@/types/compliance'

export function createComplianceSeed(): ComplianceData {
  return {
    incidents: [
      {
        id: 'DEMO-INC-13101',
        sop: 'SOP-007',
        title: 'Sample chamber note',
        note: 'A fictional reading sat outside the sample band. No probe was connected.',
        status: 'open',
        at: COMMAND_DAY,
      },
      {
        id: 'DEMO-INC-13102',
        sop: 'SOP-010',
        title: 'Sample yard note',
        note: 'A fictional visit was reviewed. No gate pass was issued.',
        status: 'closed',
        at: '2026-11-12',
      },
    ],
    actions: [
      {
        id: 'DEMO-CAP-13101',
        incidentId: 'DEMO-INC-13101',
        sop: 'SOP-007',
        title: 'Recheck the sample reading',
        due: '2026-11-20',
        status: 'open',
        note: 'Simulated follow-up. No contractor was called.',
      },
      {
        id: 'DEMO-CAP-13102',
        incidentId: 'DEMO-INC-13102',
        sop: 'SOP-010',
        title: 'Close the yard note',
        due: '2026-11-12',
        status: 'closed',
        note: 'Sample action already closed in this browser.',
      },
    ],
    inspections: [
      {
        id: 'DEMO-CIN-13101',
        sop: 'SOP-005',
        title: 'Shed checklist',
        day: COMMAND_DAY,
        status: 'done',
        note: 'Sample cleaning row. Not an official inspection.',
      },
      {
        id: 'DEMO-CIN-13102',
        sop: 'SOP-007',
        title: 'Chamber walk',
        day: '2026-11-16',
        status: 'planned',
        note: 'Planned in the demonstration calendar.',
      },
      {
        id: 'DEMO-CIN-13103',
        sop: 'SOP-015',
        title: 'Canteen hygiene',
        day: COMMAND_DAY,
        status: 'done',
        note: 'Restaurant template only. Not a food licence.',
      },
    ],
    audit: [
      {
        id: 'DEMO-AUD-13101',
        at: `${COMMAND_DAY}T09:00:00+05:30`,
        sop: 'SOP-001',
        title: 'Matrix loaded',
        detail: 'The 15-SOP sample was prepared for Dimapur Central.',
        label: AUDIT_LABEL,
      },
    ],
    incidentSeq: 13201,
    actionSeq: 13201,
    inspectionSeq: 13201,
    auditSeq: 13201,
  }
}
