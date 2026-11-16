import { toUnits } from '@/services/warehouse-rules'
import type { WarehouseData } from '@/types/warehouse'

const DAY = '2026-11-14'

export function createWarehouseSeed(): WarehouseData {
  return {
    sheds: [
      { id: 'DEMO-WH-8101', code: 'WH-D1', name: 'Dimapur shed A', mandiId: 'mandi-dimapur', capacityUnits: toUnits(200) },
      { id: 'DEMO-WH-8102', code: 'WH-D2', name: 'Dimapur shed B', mandiId: 'mandi-dimapur', capacityUnits: toUnits(80) },
      { id: 'DEMO-WH-8103', code: 'WH-D3', name: 'Dimapur shed C', mandiId: 'mandi-dimapur', capacityUnits: toUnits(40) },
    ],
    contracts: [
      {
        id: 'DEMO-WHC-8101',
        contractNo: 'DEMO-WHC-8101',
        mandiId: 'mandi-dimapur',
        shedId: 'DEMO-WH-8101',
        shedCode: 'WH-D1',
        operatorId: 'DEMO-REG-WO-5001',
        operatorLabel: 'WH-D1',
        experience: 'Sample shed keeping for chilli and ginger. Not a licence.',
        status: 'issued',
        depositPaise: 2_500_000,
        receiptId: 'DEMO-WH-RCT-8101',
        start: '2025-12-01',
        end: '2026-12-01',
        history: [
          { at: '2025-11-20T10:00:00+05:30', status: 'submitted', note: 'Application filed in the sample.' },
          { at: '2025-11-22T10:00:00+05:30', status: 'issued', note: 'Contract issued in this browser. Not a deed.' },
        ],
        createdAt: '2025-11-20T10:00:00+05:30',
        updatedAt: '2025-11-22T10:00:00+05:30',
      },
      {
        id: 'DEMO-WHC-8102',
        contractNo: 'DEMO-WHC-8102',
        mandiId: 'mandi-dimapur',
        shedId: 'DEMO-WH-8102',
        shedCode: 'WH-D2',
        operatorId: 'DEMO-REG-WO-5002',
        operatorLabel: 'WH-K2',
        experience: 'Kohima desk code applying for the Dimapur shed B sample.',
        status: 'under-verification',
        depositPaise: 0,
        receiptId: '',
        start: '2026-11-14',
        end: '2027-11-13',
        history: [
          { at: `${DAY}T09:00:00+05:30`, status: 'submitted', note: 'Application filed.' },
          { at: `${DAY}T09:20:00+05:30`, status: 'under-verification', note: 'Waiting on the Mandi official desk.' },
        ],
        createdAt: `${DAY}T09:00:00+05:30`,
        updatedAt: `${DAY}T09:20:00+05:30`,
      },
    ],
    moves: [
      {
        id: 'DEMO-WHM-8101',
        moveNo: 'DEMO-WHM-8101',
        kind: 'inward',
        shedId: 'DEMO-WH-8101',
        shedCode: 'WH-D1',
        lotId: 'DEMO-LOT-5101',
        lotNo: 'DEMO-LOT-5101',
        commodityName: 'Naga king chilli',
        gradeName: 'A',
        unitSymbol: 'q',
        quantityUnits: toUnits(4),
        partyLabel: 'DG-14',
        note: 'Sample inward from the gate lot. Not a receipt.',
        at: `${DAY}T10:15:00+05:30`,
      },
    ],
    inspections: [
      {
        id: 'DEMO-WHK-8101',
        kind: 'cleaning',
        shedId: 'DEMO-WH-8101',
        shedCode: 'WH-D1',
        items: [
          { id: 'floor', label: 'Floor swept and free of spilled produce', result: 'yes' },
          { id: 'waste', label: 'Waste bins emptied', result: 'yes' },
          { id: 'drain', label: 'Drains clear', result: 'yes' },
        ],
        note: 'Morning sample. No pest noted.',
        at: `${DAY}T08:30:00+05:30`,
      },
    ],
    insurance: [
      {
        id: 'DEMO-INS-8101',
        policyNo: 'DEMO-INS-8101',
        shedId: 'DEMO-WH-8101',
        shedCode: 'WH-D1',
        cover: 'Fire and theft sample for stored produce',
        until: '2026-12-10',
        note: 'Simulated cover. No insurer and no claim.',
      },
    ],
    maintenance: [
      {
        id: 'DEMO-MNT-8101',
        shedId: 'DEMO-WH-8101',
        shedCode: 'WH-D1',
        title: 'Door roller noted',
        status: 'open',
        note: 'Sample log. No work order was sent.',
        at: `${DAY}T11:00:00+05:30`,
      },
    ],
    contractSeq: 8201,
    moveSeq: 8201,
    inspectionSeq: 8201,
    insuranceSeq: 8201,
    maintenanceSeq: 8201,
  }
}
