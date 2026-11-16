import type {
  ActivityEntry,
  CommodityRecord,
  FeeRecord,
  GradeRecord,
  LocationRecord,
  Party,
  RegistryCollection,
  RegistryData,
  SampleLicence,
  SampleTransaction,
  UnitRecord,
} from '@/types/registry'

const AT = '2026-11-14T08:00:00+05:30'
export const SEED_MANDI_ID = 'mandi-dimapur'

export const commodityIds = {
  chilli: 'DEMO-COM-0001',
  ginger: 'DEMO-COM-0002',
  pineapple: 'DEMO-COM-0003',
  rice: 'DEMO-COM-0004',
  cardamom: 'DEMO-COM-0005',
  orange: 'DEMO-COM-0006',
  kiwi: 'DEMO-COM-0007',
  bamboo: 'DEMO-COM-0008',
} as const

function party(
  partial: Omit<Party, 'documents' | 'createdAt' | 'updatedAt' | 'commodityId' | 'notes' | 'vehicleNo' | 'siteCode' | 'mandiId'> &
    Partial<Pick<Party, 'commodityId' | 'notes' | 'vehicleNo' | 'siteCode' | 'documents' | 'mandiId'>>,
): Party {
  return {
    mandiId: SEED_MANDI_ID,
    commodityId: '',
    notes: '',
    vehicleNo: '',
    siteCode: '',
    documents: [],
    createdAt: AT,
    updatedAt: AT,
    ...partial,
  }
}

function loaded(collection: RegistryCollection, recordId: string): ActivityEntry {
  return {
    id: `ACT-SEED-${recordId}`,
    at: AT,
    title: 'Sample loaded',
    detail: 'This row was placed in the demonstration register. It is not an office filing.',
    recordId,
    collection,
  }
}

const parties: Party[] = [
  party({
    id: 'DEMO-REG-FS-1001',
    kind: 'farmer',
    label: 'DG-14',
    area: 'Dimapur sample belt',
    phone: '70000-10014',
    status: 'Active',
    commodityId: commodityIds.chilli,
    notes: 'Linked to gate lot DEMO-LOT-2414 in the yard sample.',
    documents: [
      {
        id: 'DOC-FS-1001',
        name: 'DEMO-note-DG-14.txt',
        mimeType: 'text/plain',
        size: 96,
        previewDataUrl: null,
        addedAt: AT,
      },
    ],
  }),
  party({
    id: 'DEMO-REG-FS-1002',
    kind: 'farmer',
    label: 'KR-08',
    area: 'Kohima ridge sample',
    phone: '70000-10008',
    status: 'Active',
    commodityId: commodityIds.kiwi,
  }),
  party({
    id: 'DEMO-REG-FS-1003',
    kind: 'farmer',
    label: 'MK-03',
    area: 'Mokokchung sample belt',
    phone: '70000-10003',
    status: 'Active',
    commodityId: commodityIds.rice,
  }),
  party({
    id: 'DEMO-REG-FS-1004',
    kind: 'farmer',
    label: 'WK-19',
    area: 'Wokha sample belt',
    phone: '70000-10019',
    status: 'Active',
    commodityId: commodityIds.orange,
  }),
  party({
    id: 'DEMO-REG-FS-1005',
    kind: 'farmer',
    label: 'DM-21',
    area: 'Dimapur sample belt',
    phone: '70000-10021',
    status: 'Inactive',
    commodityId: commodityIds.ginger,
    notes: 'Kept on the sample list and marked inactive.',
  }),
  party({
    id: 'DEMO-REG-BY-2001',
    kind: 'buyer',
    label: 'BY-03',
    area: 'Dimapur sample belt',
    phone: '70000-20003',
    status: 'Active',
    commodityId: commodityIds.chilli,
  }),
  party({
    id: 'DEMO-REG-BY-2002',
    kind: 'buyer',
    label: 'BY-11',
    area: 'Kohima ridge sample',
    phone: '70000-20011',
    status: 'Active',
    commodityId: commodityIds.pineapple,
  }),
  party({
    id: 'DEMO-REG-BY-2003',
    kind: 'buyer',
    label: 'BY-18',
    area: 'Tuensang sample belt',
    phone: '70000-20018',
    status: 'Active',
    commodityId: commodityIds.cardamom,
  }),
  party({
    id: 'DEMO-REG-BY-2004',
    kind: 'buyer',
    label: 'BY-22',
    area: 'Dimapur sample belt',
    phone: '70000-20022',
    status: 'Inactive',
    commodityId: commodityIds.ginger,
  }),
  party({
    id: 'DEMO-REG-AD-3001',
    kind: 'aadathiya',
    label: 'AD-02',
    area: 'Dimapur sample belt',
    phone: '70000-30002',
    status: 'Active',
    commodityId: commodityIds.chilli,
  }),
  party({
    id: 'DEMO-REG-AD-3002',
    kind: 'aadathiya',
    label: 'AD-09',
    area: 'Wokha sample belt',
    phone: '70000-30009',
    status: 'Active',
    commodityId: commodityIds.ginger,
  }),
  party({
    id: 'DEMO-REG-AD-3003',
    kind: 'aadathiya',
    label: 'TRD-07',
    area: 'Mokokchung sample belt',
    phone: '70000-30007',
    status: 'Active',
    commodityId: commodityIds.cardamom,
  }),
  party({
    id: 'DEMO-REG-AD-3004',
    kind: 'aadathiya',
    label: 'AD-15',
    area: 'Kohima ridge sample',
    phone: '70000-30015',
    status: 'Active',
    commodityId: commodityIds.kiwi,
  }),
  party({
    id: 'DEMO-REG-TR-4001',
    kind: 'transporter',
    label: 'TR-214',
    area: 'Dimapur sample belt',
    phone: '70000-40214',
    status: 'Active',
    vehicleNo: 'NL07-DEMO-214',
  }),
  party({
    id: 'DEMO-REG-TR-4002',
    kind: 'transporter',
    label: 'TR-088',
    area: 'Kohima ridge sample',
    phone: '70000-40088',
    status: 'Active',
    vehicleNo: 'NL01-DEMO-088',
  }),
  party({
    id: 'DEMO-REG-TR-4003',
    kind: 'transporter',
    label: 'TR-041',
    area: 'Mokokchung sample belt',
    phone: '70000-40041',
    status: 'Active',
    vehicleNo: 'NL02-DEMO-041',
  }),
  party({
    id: 'DEMO-REG-TR-4004',
    kind: 'transporter',
    label: 'TR-116',
    area: 'Tuensang sample belt',
    phone: '70000-40116',
    status: 'Inactive',
    vehicleNo: 'NL05-DEMO-116',
  }),
  party({
    id: 'DEMO-REG-WO-5001',
    kind: 'warehouse-operator',
    label: 'WH-D1',
    area: 'Dimapur sample shed',
    phone: '70000-50001',
    status: 'Active',
    siteCode: 'WH-D1',
  }),
  party({
    id: 'DEMO-REG-WO-5002',
    kind: 'warehouse-operator',
    label: 'WH-K2',
    area: 'Kohima sample shed',
    phone: '70000-50002',
    status: 'Active',
    siteCode: 'WH-K2',
  }),
  party({
    id: 'DEMO-REG-WO-5003',
    kind: 'warehouse-operator',
    label: 'WH-M1',
    area: 'Mokokchung sample shed',
    phone: '70000-50003',
    status: 'Active',
    siteCode: 'WH-M1',
  }),
  party({
    id: 'DEMO-REG-WO-5004',
    kind: 'warehouse-operator',
    label: 'WH-T1',
    area: 'Tuensang sample shed',
    phone: '70000-50004',
    status: 'Active',
    siteCode: 'WH-T1',
  }),
  party({
    id: 'DEMO-REG-FO-6001',
    kind: 'facility-operator',
    label: 'FB-01',
    area: 'Kisan Bhavan sample',
    phone: '70000-60001',
    status: 'Active',
    siteCode: 'FB-01',
  }),
  party({
    id: 'DEMO-REG-FO-6002',
    kind: 'facility-operator',
    label: 'FB-02',
    area: 'Hotel sample desk',
    phone: '70000-60002',
    status: 'Active',
    siteCode: 'FB-02',
  }),
  party({
    id: 'DEMO-REG-FO-6003',
    kind: 'facility-operator',
    label: 'FB-03',
    area: 'Restaurant sample desk',
    phone: '70000-60003',
    status: 'Active',
    siteCode: 'FB-03',
  }),
  party({
    id: 'DEMO-REG-FO-6004',
    kind: 'facility-operator',
    label: 'FB-04',
    area: 'Community hall sample',
    phone: '70000-60004',
    status: 'Inactive',
    siteCode: 'FB-04',
  }),
]

const commodities: CommodityRecord[] = [
  ['DEMO-COM-0001', 'Naga king chilli', 'Spice', 'Winter sample'],
  ['DEMO-COM-0002', 'Ginger', 'Spice', 'Winter sample'],
  ['DEMO-COM-0003', 'Pineapple', 'Fruit', 'Summer sample'],
  ['DEMO-COM-0004', 'Sticky rice', 'Grain', 'Autumn sample'],
  ['DEMO-COM-0005', 'Large cardamom', 'Spice', 'Autumn sample'],
  ['DEMO-COM-0006', 'Orange', 'Fruit', 'Winter sample'],
  ['DEMO-COM-0007', 'Kiwi', 'Fruit', 'Autumn sample'],
  ['DEMO-COM-0008', 'Bamboo shoot', 'Vegetable', 'Monsoon sample'],
].map(([id, name, category, season]) => ({
  id,
  mandiId: SEED_MANDI_ID,
  name,
  category,
  season,
  status: 'Active' as const,
  createdAt: AT,
  updatedAt: AT,
}))

const grades: GradeRecord[] = [
  [commodityIds.chilli, 'A', 'Top sample band for chilli.'],
  [commodityIds.chilli, 'B', 'Second sample band for chilli.'],
  [commodityIds.chilli, 'Mixed', 'Unsorted sample band.'],
  [commodityIds.ginger, 'A', 'Top sample band for ginger.'],
  [commodityIds.ginger, 'B', 'Second sample band for ginger.'],
  [commodityIds.kiwi, 'Export sample', 'A label only. Nothing is exported.'],
].map(([commodityId, name, description], index) => ({
  id: `DEMO-GRD-${String(index + 1).padStart(4, '0')}`,
  mandiId: SEED_MANDI_ID,
  commodityId,
  name,
  description,
  status: 'Active' as const,
  createdAt: AT,
  updatedAt: AT,
}))

const units: UnitRecord[] = [
  ['Quintal', 'q', 'Weight'],
  ['Kilogram', 'kg', 'Weight'],
  ['Metric tonne', 'MT', 'Weight'],
  ['Crate', 'crate', 'Count'],
  ['Piece', 'pc', 'Count'],
].map(([name, symbol, kind], index) => ({
  id: `DEMO-UNT-${String(index + 1).padStart(4, '0')}`,
  mandiId: SEED_MANDI_ID,
  name,
  symbol,
  kind: kind as UnitRecord['kind'],
  status: 'Active' as const,
  createdAt: AT,
  updatedAt: AT,
}))

const locations: LocationRecord[] = (
  [
    ['mandi-dimapur', 'Dimapur Central', 'Dimapur', 'DMP', true],
    ['mandi-kohima', 'Kohima Ridge', 'Kohima', 'KMA', false],
    ['mandi-mokokchung', 'Mokokchung', 'Mokokchung', 'MKG', false],
    ['mandi-wokha', 'Wokha', 'Wokha', 'WKA', false],
    ['mandi-tuensang', 'Tuensang', 'Tuensang', 'TNS', false],
  ] as const
).map(([id, name, district, code, active]) => ({
  id,
  mandiId: id,
  name,
  district,
  code,
  active: Boolean(active),
  status: 'Active' as const,
  createdAt: AT,
  updatedAt: AT,
}))

const fees: FeeRecord[] = [
  ['Market fee sample', 'Per quintal', '₹1.00 sample'],
  ['Weighment sample', 'Per vehicle', '₹0 sample'],
  ['Parking sample', 'Per bay-day', '₹0 sample'],
  ['Cold chamber sample', 'Per room-day', '₹0 sample'],
  ['Handling sample', 'Per lot', '₹0 sample'],
].map(([name, basis, sampleRate], index) => ({
  id: `DEMO-FEE-${String(index + 1).padStart(4, '0')}`,
  mandiId: SEED_MANDI_ID,
  name,
  basis,
  sampleRate,
  status: 'Active' as const,
  createdAt: AT,
  updatedAt: AT,
}))

const transactions: SampleTransaction[] = [
  {
    id: 'DEMO-TXN-2414',
    partyId: 'DEMO-REG-FS-1001',
    mandiId: SEED_MANDI_ID,
    at: '2026-11-14T08:10:00+05:30',
    summary: 'Gate lot DEMO-LOT-2414 · Naga king chilli · 4.2 MT',
    amountLabel: 'No amount · sample only',
  },
  {
    id: 'DEMO-TXN-2412',
    partyId: 'DEMO-REG-BY-2002',
    mandiId: SEED_MANDI_ID,
    at: '2026-11-14T06:50:00+05:30',
    summary: 'Gate lot DEMO-LOT-2412 · Pineapple · noted at Kohima Ridge',
    amountLabel: 'No amount · sample only',
  },
  {
    id: 'DEMO-TXN-3001',
    partyId: 'DEMO-REG-AD-3001',
    mandiId: SEED_MANDI_ID,
    at: '2026-11-14T08:20:00+05:30',
    summary: 'Floor note for DEMO-LOT-2414 · no commission posted',
    amountLabel: 'No amount · sample only',
  },
]

const licences: SampleLicence[] = [
  {
    id: 'DEMO-LIC-014',
    partyId: 'DEMO-REG-FS-1001',
    mandiId: SEED_MANDI_ID,
    band: 'Active',
    label: 'Seller sample band',
    detail: 'Counted in the licence mix. This desk does not issue it.',
  },
  {
    id: 'DEMO-LIC-203',
    partyId: 'DEMO-REG-BY-2001',
    mandiId: SEED_MANDI_ID,
    band: 'Expiring',
    label: 'Buyer sample band',
    detail: 'Shown in the expiring band of the demonstration. Renewal is not filed here.',
  },
  {
    id: 'DEMO-LIC-309',
    partyId: 'DEMO-REG-AD-3001',
    mandiId: SEED_MANDI_ID,
    band: 'Pending',
    label: 'Trader sample band',
    detail: 'Pending in the sample mix. Nothing is submitted.',
  },
]

function catalogActivities(): ActivityEntry[] {
  return [
    ...commodities.map((row) => loaded('commodity', row.id)),
    ...grades.map((row) => loaded('grade', row.id)),
    ...units.map((row) => loaded('unit', row.id)),
    ...locations.map((row) => loaded('location', row.id)),
    ...fees.map((row) => loaded('fee', row.id)),
    ...parties.map((row) => loaded(row.kind, row.id)),
  ]
}

export function createSeed(): RegistryData {
  return {
    parties,
    commodities,
    grades,
    units,
    locations,
    fees,
    activities: catalogActivities(),
    transactions,
    licences,
    seq: 7001,
  }
}
