import type { DemoAccount, RoleId } from '@/types/access'
import { ROLE_IDS } from '@/types/access'

export const demoAccounts: DemoAccount[] = [
  { id: 'demo.super', roleId: 'super-admin', label: 'Super Admin desk' },
  { id: 'demo.manager', roleId: 'mandi-manager', label: 'Mandi Manager desk' },
  { id: 'demo.licence', roleId: 'licence-officer', label: 'Licence Officer desk' },
  { id: 'demo.accounts', roleId: 'accounts-officer', label: 'Accounts Officer desk' },
  { id: 'demo.aadathiya', roleId: 'aadathiya', label: 'Aadathiya desk' },
  { id: 'demo.farmer', roleId: 'farmer-seller', label: 'Farmer / Seller desk' },
  { id: 'demo.buyer', roleId: 'buyer', label: 'Buyer desk' },
  { id: 'demo.warehouse', roleId: 'warehouse-operator', label: 'Warehouse Operator desk' },
  { id: 'demo.cold', roleId: 'cold-storage-operator', label: 'Cold Storage Operator desk' },
  { id: 'demo.flp', roleId: 'flp-operator', label: 'FLP Operator desk' },
  { id: 'demo.parking', roleId: 'parking-operator', label: 'Parking / Transport desk' },
  { id: 'demo.facility', roleId: 'facility-operator', label: 'Facility Operator desk' },
  { id: 'demo.inspector', roleId: 'inspector', label: 'Inspector / Auditor desk' },
]

export function findAccount(accountId: string) {
  return demoAccounts.find((account) => account.id === accountId) ?? null
}

export function findAccountByRole(roleId: RoleId) {
  return demoAccounts.find((account) => account.roleId === roleId) ?? null
}

export function isRoleId(value: string | null): value is RoleId {
  return value !== null && (ROLE_IDS as readonly string[]).includes(value)
}
