import type { RoleId, RolePermission } from '@/types/access'

const networkModules = [
  'stakeholders',
  'licences',
  'arrivals',
  'trading',
  'finance',
  'warehouses',
  'cold-storage',
  'post-harvest',
  'parking',
  'facilities',
  'compliance',
  'reports',
]

export const rolePermissions: RolePermission[] = [
  {
    id: 'super-admin',
    title: 'Super Admin',
    summary: 'Demonstration oversight of every yard sample. No authority is granted.',
    modules: networkModules,
    operationsDesk: true,
    widgets: [
      { label: 'Yards in sample', value: '5', hint: 'Fictional Nagaland network' },
      { label: 'Open role checks', value: '4', hint: 'Simulated permission review' },
      { label: 'Desk notices', value: '4', hint: 'Unread demonstration notices' },
    ],
    tasks: [
      { id: 'TASK-SA-1', title: 'Review the licence sample', detail: '36 Dimapur licences sit in the expiring band of the demonstration.', due: '14 Nov 2026' },
      { id: 'TASK-SA-2', title: 'Confirm chamber status', detail: 'One Tuensang chamber is marked offline in the sample.', due: '14 Nov 2026' },
      { id: 'TASK-SA-3', title: 'Read the fee sample', detail: 'The eight-week trade sample is ready for a desk review. No settlement is made.', due: '15 Nov 2026' },
    ],
    activity: [
      { id: 'ACT-SA-1', title: 'Session opened', detail: 'The Super Admin demonstration desk was selected in this browser.', at: '14 Nov 2026, 09:00' },
      { id: 'ACT-SA-2', title: 'Gate sample refreshed', detail: 'Dimapur Central shows the morning arrival sample.', at: '14 Nov 2026, 08:40' },
      { id: 'ACT-SA-3', title: 'Compliance note listed', detail: 'Seven open compliance notes are in the yard sample.', at: '14 Nov 2026, 08:10' },
    ],
    shortcuts: [
      { label: 'Arrivals', to: '/arrivals', detail: 'Gate lots' },
      { label: 'Trading', to: '/trading', detail: 'SOP-002 desk' },
      { label: 'Licences', to: '/licences', detail: 'SOP-001 desk' },
      { label: 'Finance', to: '/finance', detail: 'Simulated book' },
      { label: 'Compliance', to: '/compliance', detail: 'NRR checkpoints' },
      { label: 'Reports', to: '/reports', detail: 'Network summary map' },
    ],
  },
  {
    id: 'mandi-manager',
    title: 'Mandi Manager',
    summary: 'Yard-day sample for arrivals, trade and infrastructure. Nothing is approved here.',
    modules: networkModules,
    operationsDesk: true,
    widgets: [
      { label: 'Arrivals today', value: '186 MT', hint: 'Demonstration day total' },
      { label: 'Lots on the floor', value: '11', hint: 'Fictional gate lots in view' },
      { label: 'Open compliance', value: '7', hint: 'Across the five yard samples' },
    ],
    tasks: [
      { id: 'TASK-MM-1', title: 'Watch the Dimapur gate', detail: 'Six sample vehicles are past the twenty-minute mark.', due: '14 Nov 2026' },
      { id: 'TASK-MM-2', title: 'Check warehouse occupancy', detail: 'The mean occupancy in the sample is 65 percent.', due: '14 Nov 2026' },
      { id: 'TASK-MM-3', title: 'Note expiring licences', detail: 'The licence mix includes 92 expiring records.', due: '15 Nov 2026' },
    ],
    activity: [
      { id: 'ACT-MM-1', title: 'Morning desk opened', detail: 'The manager sample uses the 14 Nov 2026 yard figures.', at: '14 Nov 2026, 07:55' },
      { id: 'ACT-MM-2', title: 'Weighbridge noted', detail: 'Kohima Ridge is marked open in the demonstration.', at: '14 Nov 2026, 07:10' },
      { id: 'ACT-MM-3', title: 'Trade week posted', detail: 'The week ending 14 Nov is the latest bar on the trade chart.', at: '14 Nov 2026, 06:40' },
    ],
    shortcuts: [
      { label: 'Arrivals', to: '/arrivals', detail: 'Gate lots' },
      { label: 'Trading', to: '/trading', detail: 'Floor trades' },
      { label: 'Warehouses', to: '/warehouses', detail: 'SOP-004 and SOP-005' },
      { label: 'Reports', to: '/reports', detail: 'Yard summary map' },
    ],
  },
  {
    id: 'licence-officer',
    title: 'Licence Officer',
    summary: 'Licence verification, register and issue. Numbers generated here are simulated.',
    modules: ['stakeholders', 'licences', 'compliance', 'reports'],
    operationsDesk: false,
    widgets: [
      { label: 'Active in sample', value: '1,040', hint: 'After all yards' },
      { label: 'Expiring', value: '92', hint: 'Demonstration band' },
      { label: 'Pending', value: '39', hint: 'Not submitted anywhere' },
    ],
    tasks: [
      { id: 'TASK-LO-1', title: 'Read expiring Dimapur rows', detail: '36 fictional licences are in the expiring band.', due: '14 Nov 2026' },
      { id: 'TASK-LO-2', title: 'Check suspended rows', detail: '19 suspended records are in the sample mix.', due: '14 Nov 2026' },
      { id: 'TASK-LO-3', title: 'Open the stakeholder map', detail: 'The stakeholder register is on this desk.', due: '16 Nov 2026' },
    ],
    activity: [
      { id: 'ACT-LO-1', title: 'Licence mix loaded', detail: 'Active, expiring, suspended and pending counts are sample figures.', at: '14 Nov 2026, 09:10' },
      { id: 'ACT-LO-2', title: 'No issue recorded', detail: 'This desk cannot grant or renew a licence.', at: '14 Nov 2026, 09:10' },
      { id: 'ACT-LO-3', title: 'Compliance link listed', detail: 'NRR checkpoints stay on the operating map.', at: '13 Nov 2026, 16:20' },
    ],
    shortcuts: [
      { label: 'Licences', to: '/licences', detail: 'SOP-001 desk' },
      { label: 'Stakeholders', to: '/stakeholders', detail: 'Party register map' },
      { label: 'Compliance', to: '/compliance', detail: 'NRR checkpoints' },
    ],
  },
  {
    id: 'accounts-officer',
    title: 'Accounts Officer',
    summary: 'Fee, trade and simulated finance samples. No payment or settlement is processed.',
    modules: ['trading', 'finance', 'licences', 'reports'],
    operationsDesk: false,
    widgets: [
      { label: 'Eight-week sample', value: '₹17.88 cr', hint: 'Fictional trade total' },
      { label: 'Latest week', value: '14 Nov', hint: 'Demonstration week ending' },
      { label: 'Fee desk', value: 'Sample', hint: 'No invoice is raised' },
    ],
    tasks: [
      { id: 'TASK-AO-1', title: 'Read the trade chart', detail: 'Return to the manager desk sample if a yard total is needed. This role sees the fee map.', due: '14 Nov 2026' },
      { id: 'TASK-AO-2', title: 'Open the simulated finance book', detail: 'Credit-note redemption cannot pass the Aadathiya security balance.', due: '14 Nov 2026' },
      { id: 'TASK-AO-3', title: 'Hold settlement', detail: 'Nothing on this desk moves money.', due: '15 Nov 2026' },
    ],
    activity: [
      { id: 'ACT-AO-1', title: 'Finance sample listed', detail: 'The accounts desk can post simulated notes. No money moves.', at: '14 Nov 2026, 10:00' },
      { id: 'ACT-AO-2', title: 'Trade week noted', detail: 'Week labels run from 27 Sep to 14 Nov in the demonstration.', at: '14 Nov 2026, 09:30' },
      { id: 'ACT-AO-3', title: 'Report map available', detail: 'Cross-procedure reports are prepared in this browser.', at: '13 Nov 2026, 15:00' },
    ],
    shortcuts: [
      { label: 'Finance', to: '/finance', detail: 'Simulated book' },
      { label: 'Licences', to: '/licences', detail: 'Sample receipts' },
      { label: 'Trading', to: '/trading', detail: 'SOP-002 book' },
      { label: 'Reports', to: '/reports', detail: 'Summary map' },
    ],
  },
  {
    id: 'aadathiya',
    title: 'Aadathiya',
    summary: 'Commission-agent desk for arrivals and written floor trades. No money is collected.',
    modules: ['stakeholders', 'arrivals', 'trading', 'licences'],
    operationsDesk: false,
    widgets: [
      { label: 'Lots to note', value: '11', hint: 'Fictional gate lots' },
      { label: 'Chilli share', value: 'Sample', hint: 'Naga king chilli is in the mix' },
      { label: 'Floor status', value: 'Open', hint: 'Demonstration only' },
    ],
    tasks: [
      { id: 'TASK-AD-1', title: 'Note DEMO-LOT-2414', detail: '4.2 MT of Naga king chilli is marked on the floor at Dimapur.', due: '14 Nov 2026' },
      { id: 'TASK-AD-2', title: 'Read the ginger lot', detail: 'DEMO-LOT-2413 is weighed in the sample.', due: '14 Nov 2026' },
      { id: 'TASK-AD-3', title: 'Open the trading desk', detail: 'SOP-002 records a written rate and a seller parchi.', due: '15 Nov 2026' },
    ],
    activity: [
      { id: 'ACT-AD-1', title: 'Lot sample listed', detail: 'Gate lots use fictional grower labels and demo vehicle numbers.', at: '14 Nov 2026, 08:10' },
      { id: 'ACT-AD-2', title: 'Stakeholder map listed', detail: 'Farmer and trader registers are not editable here.', at: '14 Nov 2026, 08:00' },
      { id: 'ACT-AD-3', title: 'No commission posted', detail: 'This desk does not calculate a fee.', at: '13 Nov 2026, 18:00' },
    ],
    shortcuts: [
      { label: 'Arrivals', to: '/arrivals', detail: 'Gate lots' },
      { label: 'Trading', to: '/trading', detail: 'SOP-002 desk' },
      { label: 'Stakeholders', to: '/stakeholders', detail: 'Party register map' },
      { label: 'Licences', to: '/licences', detail: 'SOP-001 desk' },
    ],
  },
  {
    id: 'farmer-seller',
    title: 'Farmer / Seller',
    summary: 'A seller desk for lots, parchis and licence status. No payment is received.',
    modules: ['arrivals', 'licences', 'trading'],
    operationsDesk: false,
    widgets: [
      { label: 'Sample lot', value: 'DEMO-LOT-2414', hint: 'Dimapur chilli, on floor' },
      { label: 'Quantity', value: '4.2 MT', hint: 'Fictional weighment' },
      { label: 'Licence band', value: 'SOP-001', hint: 'Simulated applications' },
    ],
    tasks: [
      { id: 'TASK-FS-1', title: 'Read your sample lot', detail: 'The lot belongs to fictional grower DG-14.', due: '14 Nov 2026' },
      { id: 'TASK-FS-2', title: 'Open the licence desk', detail: 'SOP-001 applications are simulated in this browser.', due: '14 Nov 2026' },
      { id: 'TASK-FS-3', title: 'Read the sale book', detail: 'A parchi is a demonstration slip. No produce is paid for here.', due: '15 Nov 2026' },
    ],
    activity: [
      { id: 'ACT-FS-1', title: 'Gate-in sample', detail: 'Vehicle NL07-DEMO-214 is attached to DEMO-LOT-2414.', at: '14 Nov 2026, 08:10' },
      { id: 'ACT-FS-2', title: 'Seller desk opened', detail: 'This role cannot see finance, warehouses or compliance.', at: '14 Nov 2026, 08:05' },
      { id: 'ACT-FS-3', title: 'Earlier lot closed', detail: 'DEMO-LOT-2407 is marked dispatched in the sample.', at: '10 Nov 2026, 13:25' },
    ],
    shortcuts: [
      { label: 'Arrivals', to: '/arrivals', detail: 'Gate lots' },
      { label: 'Licences', to: '/licences', detail: 'SOP-001 desk' },
      { label: 'Trading', to: '/trading', detail: 'Seller parchi' },
    ],
  },
  {
    id: 'buyer',
    title: 'Buyer',
    summary: 'A buyer desk for requirements and parchis. No purchase payment is taken.',
    modules: ['arrivals', 'trading', 'licences'],
    operationsDesk: false,
    widgets: [
      { label: 'Lots in sample', value: '11', hint: 'Inside the 30-day window' },
      { label: 'On the floor', value: 'Sample', hint: 'Not offered for sale' },
      { label: 'Buying desk', value: 'SOP-003', hint: 'Buyer parchi' },
    ],
    tasks: [
      { id: 'TASK-BY-1', title: 'Read lots on the floor', detail: 'Chilli, cardamom and kiwi rows are marked on the floor in the sample.', due: '14 Nov 2026' },
      { id: 'TASK-BY-2', title: 'Open the buying desk', detail: 'SOP-003 records a buyer requirement and a buyer parchi.', due: '14 Nov 2026' },
      { id: 'TASK-BY-3', title: 'Ignore fee screens', detail: 'Finance is outside this demonstration role.', due: '15 Nov 2026' },
    ],
    activity: [
      { id: 'ACT-BY-1', title: 'Floor sample opened', detail: 'The buyer desk lists arrivals and trading only.', at: '14 Nov 2026, 09:20' },
      { id: 'ACT-BY-2', title: 'Pineapple at gate', detail: 'DEMO-LOT-2412 is gate-in at Kohima Ridge.', at: '14 Nov 2026, 06:50' },
      { id: 'ACT-BY-3', title: 'No bid stored', detail: 'This browser does not keep a purchase.', at: '13 Nov 2026, 17:40' },
    ],
    shortcuts: [
      { label: 'Arrivals', to: '/arrivals', detail: 'Gate lots' },
      { label: 'Licences', to: '/licences', detail: 'SOP-001 desk' },
      { label: 'Trading', to: '/trading', detail: 'SOP-003 desk' },
    ],
  },
  {
    id: 'warehouse-operator',
    title: 'Warehouse Operator',
    summary: 'Shed stock, checklists and contract applications. No deed is signed.',
    modules: ['arrivals', 'warehouses'],
    operationsDesk: false,
    widgets: [
      { label: 'Operator desk', value: 'WH-D1', hint: 'Sample shed code' },
      { label: 'Contract path', value: 'SOP-004', hint: 'Application through issue' },
      { label: 'Stock book', value: 'SOP-005', hint: 'Linked to gate lots' },
    ],
    tasks: [
      { id: 'TASK-WH-1', title: 'Read occupancy', detail: 'Tuensang is the lowest sample at 49 percent.', due: '14 Nov 2026' },
      { id: 'TASK-WH-2', title: 'Open the warehouse book', detail: 'SOP-004 applications and SOP-005 stock stay in this browser.', due: '14 Nov 2026' },
      { id: 'TASK-WH-3', title: 'Match a gate lot', detail: 'Sticky rice DEMO-LOT-2411 is dispatched from Mokokchung in the sample.', due: '15 Nov 2026' },
    ],
    activity: [
      { id: 'ACT-WH-1', title: 'Occupancy sample loaded', detail: 'Figures are yard means, not bin stock.', at: '14 Nov 2026, 08:30' },
      { id: 'ACT-WH-2', title: 'Arrival map linked', detail: 'The operator can open the gate sample map.', at: '14 Nov 2026, 08:30' },
      { id: 'ACT-WH-3', title: 'Stock sample loaded', detail: 'Movements are simulated and linked to gate lots.', at: '13 Nov 2026, 19:10' },
    ],
    shortcuts: [
      { label: 'Warehouses', to: '/warehouses', detail: 'SOP-004 and SOP-005' },
      { label: 'Arrivals', to: '/arrivals', detail: 'Gate lots' },
    ],
  },
  {
    id: 'cold-storage-operator',
    title: 'Cold Storage Operator',
    summary: 'Chamber stock, checklists and simulated temperature readings. No probe is connected.',
    modules: ['arrivals', 'cold-storage'],
    operationsDesk: false,
    widgets: [
      { label: 'Operator desk', value: 'CS-D1', hint: 'Sample chamber code' },
      { label: 'Contract path', value: 'SOP-006', hint: 'Application through issue' },
      { label: 'Readings', value: 'SOP-007', hint: 'Sample script, not a probe' },
    ],
    tasks: [
      { id: 'TASK-CS-1', title: 'Note the offline chamber', detail: 'The Tuensang sample marks one chamber offline.', due: '14 Nov 2026' },
      { id: 'TASK-CS-2', title: 'Open the cold storage book', detail: 'SOP-006 applications and SOP-007 readings stay in this browser.', due: '14 Nov 2026' },
      { id: 'TASK-CS-3', title: 'Read the demo band', detail: 'A reading outside the sample threshold is a warning. No probe is connected.', due: '15 Nov 2026' },
    ],
    activity: [
      { id: 'ACT-CS-1', title: 'Chamber sample loaded', detail: 'Online counts are fictional and yard-level.', at: '14 Nov 2026, 07:40' },
      { id: 'ACT-CS-2', title: 'Notice copied', detail: 'The offline-chamber notice is also in the bell menu.', at: '13 Nov 2026, 18:20' },
      { id: 'ACT-CS-3', title: 'Sample readings loaded', detail: 'Temperatures are a script in this browser. No IoT device is connected.', at: '13 Nov 2026, 18:20' },
    ],
    shortcuts: [
      { label: 'Cold Storage', to: '/cold-storage', detail: 'SOP-006 and SOP-007' },
    ],
  },
  {
    id: 'flp-operator',
    title: 'FLP Operator',
    summary: 'Intake, grading, packing and simulated output. No process is certified.',
    modules: ['arrivals', 'post-harvest'],
    operationsDesk: false,
    widgets: [
      { label: 'Operator desk', value: 'FLP-D1', hint: 'Sample chilli line' },
      { label: 'Trace', value: 'Lot to output', hint: 'Quantity gaps stay visible' },
      { label: 'Procedure', value: 'SOP-008', hint: 'Simulated records' },
    ],
    tasks: [
      { id: 'TASK-FLP-1', title: 'Open the FLP book', detail: 'SOP-008 intake and output stay in this browser.', due: '14 Nov 2026' },
      { id: 'TASK-FLP-2', title: 'Read the ginger discrepancy', detail: 'DEMO-FLB-10102 is short of a full grade.', due: '14 Nov 2026' },
      { id: 'TASK-FLP-3', title: 'Stay off the trading floor', detail: 'Trading is outside this demonstration role.', due: '15 Nov 2026' },
    ],
    activity: [
      { id: 'ACT-FLP-1', title: 'Unit list prepared', detail: 'Three fictional units are named only on this desk.', at: '14 Nov 2026, 09:40' },
      { id: 'ACT-FLP-2', title: 'Batch sample loaded', detail: 'Chilli intake reconciles. Ginger intake shows a discrepancy.', at: '14 Nov 2026, 09:40' },
      { id: 'ACT-FLP-3', title: 'No certificate issued', detail: 'Output records are simulated.', at: '13 Nov 2026, 12:00' },
    ],
    shortcuts: [
      { label: 'Post-Harvest', to: '/post-harvest', detail: 'SOP-008' },
    ],
  },
  {
    id: 'parking-operator',
    title: 'Parking / Transport Operator',
    summary: 'Register vehicles, reserve slots and note simulated fees. No fee is collected.',
    modules: ['parking'],
    operationsDesk: false,
    widgets: [
      { label: 'Operator desk', value: 'PK-D1', hint: 'Dimapur goods yard' },
      { label: 'Slots', value: 'Held by visit', hint: 'Occupied stays with the vehicle inside' },
      { label: 'Procedure', value: 'SOP-009 to SOP-011', hint: 'Simulated records' },
    ],
    tasks: [
      { id: 'TASK-PK-1', title: 'Open the parking book', detail: 'SOP-009 contracts and SOP-010 visits stay in this browser.', due: '14 Nov 2026' },
      { id: 'TASK-PK-2', title: 'Read slot A1', detail: 'NL07-DEMO-214 is inside. The slot cannot take another visit.', due: '14 Nov 2026' },
      { id: 'TASK-PK-3', title: 'Do not take a fee', detail: 'Parking fees are noted and not collected.', due: '15 Nov 2026' },
    ],
    activity: [
      { id: 'ACT-PK-1', title: 'Yard sample loaded', detail: 'A1 is occupied and A2 is reserved.', at: '14 Nov 2026, 07:20' },
      { id: 'ACT-PK-2', title: 'Office lease listed', detail: 'TO-D1 is a simulated allotment, not a deed.', at: '14 Nov 2026, 07:20' },
      { id: 'ACT-PK-3', title: 'Role limited', detail: 'Warehouses and finance stay off this sidebar.', at: '13 Nov 2026, 11:15' },
    ],
    shortcuts: [
      { label: 'Parking & Transport', to: '/parking', detail: 'SOP-009 to SOP-011' },
    ],
  },
  {
    id: 'facility-operator',
    title: 'Facility Operator',
    summary: 'File facility leases, stays and checklists. No deed is signed.',
    modules: ['facilities'],
    operationsDesk: false,
    widgets: [
      { label: 'Operator desk', value: 'KB-D1', hint: 'Kisan Bhavan sample' },
      { label: 'Templates', value: 'Three', hint: 'Hall, hotel and restaurant' },
      { label: 'Procedure', value: 'SOP-012 to SOP-015', hint: 'Simulated records' },
    ],
    tasks: [
      { id: 'TASK-FC-1', title: 'Open the facilities book', detail: 'SOP-012 to SOP-015 stay in this browser.', due: '14 Nov 2026' },
      { id: 'TASK-FC-2', title: 'Read room R1', detail: 'GS-14 is a fictional guest code on an open stay.', due: '14 Nov 2026' },
      { id: 'TASK-FC-3', title: 'Skip the market floor', detail: 'Arrivals and trading are outside this role.', due: '15 Nov 2026' },
    ],
    activity: [
      { id: 'ACT-FC-1', title: 'Facility list prepared', detail: 'Kisan Bhavan, hotel and restaurant sites are named.', at: '14 Nov 2026, 10:20' },
      { id: 'ACT-FC-2', title: 'Lease sample loaded', detail: 'Issued leases are simulated. They are not deeds.', at: '14 Nov 2026, 10:20' },
      { id: 'ACT-FC-3', title: 'Sidebar limited', detail: 'Only facilities, the dashboard and settings are listed.', at: '13 Nov 2026, 14:05' },
    ],
    shortcuts: [
      { label: 'Facilities & Leasing', to: '/facilities', detail: 'SOP-012 to SOP-015' },
    ],
  },
  {
    id: 'inspector',
    title: 'Inspector / Auditor',
    summary: 'Read-only sample of licences, infrastructure and compliance. No finding is filed.',
    modules: ['licences', 'warehouses', 'cold-storage', 'post-harvest', 'parking', 'facilities', 'compliance', 'reports'],
    operationsDesk: false,
    widgets: [
      { label: 'Open notes', value: '7', hint: 'Compliance sample' },
      { label: 'Chambers offline', value: '4', hint: '18 rooms, 14 online' },
      { label: 'Suspended licences', value: '19', hint: 'Demonstration mix' },
    ],
    tasks: [
      { id: 'TASK-IN-1', title: 'Read compliance notes', detail: 'Seven open notes are spread across the yard sample.', due: '14 Nov 2026' },
      { id: 'TASK-IN-2', title: 'Compare chamber counts', detail: 'Cold rooms are a sample, not an inspection sheet.', due: '14 Nov 2026' },
      { id: 'TASK-IN-3', title: 'Open the report map', detail: 'Demo CSV reports are prepared in this browser.', due: '16 Nov 2026' },
    ],
    activity: [
      { id: 'ACT-IN-1', title: 'Audit desk opened', detail: 'Trading and finance are withheld from this role.', at: '14 Nov 2026, 11:00' },
      { id: 'ACT-IN-2', title: 'Licence mix visible', detail: 'The inspector can open the licence map.', at: '14 Nov 2026, 11:00' },
      { id: 'ACT-IN-3', title: 'No finding saved', detail: 'This desk does not file an NRR observation.', at: '13 Nov 2026, 16:45' },
    ],
    shortcuts: [
      { label: 'Compliance', to: '/compliance', detail: 'NRR checkpoints' },
      { label: 'Licences', to: '/licences', detail: 'SOP-001 desk' },
      { label: 'Reports', to: '/reports', detail: 'Summary map' },
      { label: 'Cold Storage', to: '/cold-storage', detail: 'Chamber map' },
    ],
  },
]

const byId = new Map(rolePermissions.map((role) => [role.id, role]))

export function getRole(roleId: RoleId) {
  const role = byId.get(roleId)
  if (!role) {
    throw new Error(`Unknown demonstration role: ${roleId}`)
  }
  return role
}
