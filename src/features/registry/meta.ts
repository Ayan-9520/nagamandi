import type { CatalogKind, PartyKind } from '@/types/registry'

export interface PartyRegister {
  group: 'party'
  kind: PartyKind
  path: string
  title: string
  singular: string
  description: string
  prefix: string
  commodity: 'required' | 'hidden'
  vehicle: 'required' | 'optional' | 'hidden'
  site: 'required' | 'hidden'
  siteLabel: string
}

export interface CatalogRegister {
  group: 'catalog'
  kind: CatalogKind
  path: string
  title: string
  singular: string
  description: string
  prefix: string
}

export const partyRegisters: PartyRegister[] = [
  {
    group: 'party',
    kind: 'farmer',
    path: 'farmers',
    title: 'Farmers and sellers',
    singular: 'Seller',
    description: 'Fictional seller desk codes for the working mandi. No person is enrolled.',
    prefix: 'FS',
    commodity: 'required',
    vehicle: 'optional',
    site: 'hidden',
    siteLabel: 'Site code',
  },
  {
    group: 'party',
    kind: 'buyer',
    path: 'buyers',
    title: 'Buyers',
    singular: 'Buyer',
    description: 'Fictional buyer desk codes. No purchase is recorded from this form.',
    prefix: 'BY',
    commodity: 'required',
    vehicle: 'hidden',
    site: 'hidden',
    siteLabel: 'Site code',
  },
  {
    group: 'party',
    kind: 'aadathiya',
    path: 'aadathiyas',
    title: 'Aadathiyas and traders',
    singular: 'Aadathiya',
    description: 'Commission-agent and trader desk codes. No commission is calculated.',
    prefix: 'AD',
    commodity: 'required',
    vehicle: 'hidden',
    site: 'hidden',
    siteLabel: 'Site code',
  },
  {
    group: 'party',
    kind: 'transporter',
    path: 'transporters',
    title: 'Transporters',
    singular: 'Transporter',
    description: 'Demonstration vehicles. Nothing is checked in at a gate.',
    prefix: 'TR',
    commodity: 'hidden',
    vehicle: 'required',
    site: 'hidden',
    siteLabel: 'Site code',
  },
  {
    group: 'party',
    kind: 'warehouse-operator',
    path: 'warehouse-operators',
    title: 'Warehouse operators',
    singular: 'Warehouse operator',
    description: 'Shed desk codes for the warehouse sample. No receipt is issued.',
    prefix: 'WO',
    commodity: 'hidden',
    vehicle: 'hidden',
    site: 'required',
    siteLabel: 'Shed code',
  },
  {
    group: 'party',
    kind: 'facility-operator',
    path: 'facility-operators',
    title: 'Facility operators',
    singular: 'Facility operator',
    description: 'Kisan Bhavan, hotel and restaurant desk codes. No lease is signed.',
    prefix: 'FO',
    commodity: 'hidden',
    vehicle: 'hidden',
    site: 'required',
    siteLabel: 'Site code',
  },
]

export const catalogRegisters: CatalogRegister[] = [
  {
    group: 'catalog',
    kind: 'commodity',
    path: 'commodities',
    title: 'Commodities',
    singular: 'Commodity',
    description: 'Produce names used by the demonstration registers.',
    prefix: 'COM',
  },
  {
    group: 'catalog',
    kind: 'grade',
    path: 'grades',
    title: 'Commodity grades',
    singular: 'Grade',
    description: 'Grade labels attached to a commodity. They do not grade a lot.',
    prefix: 'GRD',
  },
  {
    group: 'catalog',
    kind: 'unit',
    path: 'units',
    title: 'Measurement units',
    singular: 'Unit',
    description: 'Units named for the sample. Weighment is not performed here.',
    prefix: 'UNT',
  },
  {
    group: 'catalog',
    kind: 'location',
    path: 'locations',
    title: 'Mandi locations',
    singular: 'Mandi location',
    description: 'Yards on file. One of them is the working mandi for this desk.',
    prefix: 'LOC',
  },
  {
    group: 'catalog',
    kind: 'fee',
    path: 'fees',
    title: 'Fee categories',
    singular: 'Fee category',
    description: 'Fee labels and sample rates. No fee is collected.',
    prefix: 'FEE',
  },
]

export const registers = [...partyRegisters, ...catalogRegisters]

export function partyRegister(kind: PartyKind) {
  const found = partyRegisters.find((item) => item.kind === kind)
  if (!found) throw new Error(`Unknown party register: ${kind}`)
  return found
}

export function catalogRegister(kind: CatalogKind) {
  const found = catalogRegisters.find((item) => item.kind === kind)
  if (!found) throw new Error(`Unknown catalog register: ${kind}`)
  return found
}

export function partyBasePath(kind: PartyKind) {
  return `/stakeholders/${partyRegister(kind).path}`
}

export function catalogBasePath(kind: CatalogKind) {
  return `/stakeholders/${catalogRegister(kind).path}`
}
