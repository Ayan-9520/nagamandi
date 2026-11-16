export const ROLE_IDS = [
  'super-admin',
  'mandi-manager',
  'licence-officer',
  'accounts-officer',
  'aadathiya',
  'farmer-seller',
  'buyer',
  'warehouse-operator',
  'cold-storage-operator',
  'flp-operator',
  'parking-operator',
  'facility-operator',
  'inspector',
] as const

export type RoleId = (typeof ROLE_IDS)[number]

export interface DeskWidget {
  label: string
  value: string
  hint: string
}

export interface DeskTask {
  id: string
  title: string
  detail: string
  due: string
}

export interface DeskActivity {
  id: string
  title: string
  detail: string
  at: string
}

export interface DeskShortcut {
  label: string
  to: string
  detail: string
}

export interface RolePermission {
  id: RoleId
  title: string
  summary: string
  modules: string[]
  operationsDesk: boolean
  widgets: DeskWidget[]
  tasks: DeskTask[]
  activity: DeskActivity[]
  shortcuts: DeskShortcut[]
}

export interface DemoAccount {
  id: string
  roleId: RoleId
  label: string
}
