import { findAccount, findAccountByRole, isRoleId } from '@/mocks/accounts'
import { navigation, findNavItemForPath } from '@/mocks/navigation'
import { getRole } from '@/mocks/permissions'
import type { RoleId } from '@/types/access'
import { canOpenField } from '@/services/field-rules'
import { delay } from '@/utils/delay'

export const DEMO_PASSWORD = 'demo-mandi'

const sharedPaths = new Set(['/', '/desk', '/profile', '/roles', '/unauthorized', '/settings'])

export function isPathAllowed(roleId: RoleId, pathname: string) {
  if (pathname === '/field' || pathname.startsWith('/field/')) return canOpenField(roleId)
  if (sharedPaths.has(pathname)) return true
  const item = findNavItemForPath(pathname)
  if (!item) return true
  if (item.id === 'dashboard' || item.id === 'settings') return true
  return getRole(roleId).modules.includes(item.id)
}

export function canSeeLots(roleId: RoleId) {
  const role = getRole(roleId)
  return role.operationsDesk || role.modules.includes('arrivals') || role.modules.includes('trading')
}

export function navigationForRole(roleId: RoleId) {
  const modules = new Set(getRole(roleId).modules)
  return navigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.id === 'dashboard' || item.id === 'settings' || (item.id === 'field' && canOpenField(roleId)) || modules.has(item.id)),
    }))
    .filter((group) => group.items.length > 0)
}

export async function signInDemo(accountId: string, password: string) {
  await delay(350)
  const account = findAccount(accountId.trim())
  if (!account || password !== DEMO_PASSWORD) {
    throw new Error('That demonstration desk or password was not recognised.')
  }
  return account
}

export function accountForRole(roleId: RoleId) {
  const account = findAccountByRole(roleId)
  if (!account || !isRoleId(account.roleId)) {
    throw new Error('The demonstration desk for that role is missing.')
  }
  return account
}
