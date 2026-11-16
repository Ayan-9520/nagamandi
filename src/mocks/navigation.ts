import type { NavItem } from '@/types/domain'

export const navigation: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        to: '/desk',
        icon: 'dashboard',
        summary: 'Yard desk for arrivals, trade samples and licence mix.',
        sop: 'Operating overview',
        available: true,
      },
      {
        id: 'field',
        title: 'Field',
        to: '/field',
        icon: 'field',
        summary: 'Mobile drafts for arrivals, inspections, parchis, parking and facilities. Nothing is finalized offline.',
        sop: 'Field operations',
        available: true,
      },
    ],
  },
  {
    label: 'Registry',
    items: [
      {
        id: 'stakeholders',
        title: 'Stakeholders',
        to: '/stakeholders',
        icon: 'stakeholders',
        summary: 'Farmer, buyer, trader and mandi master registers.',
        sop: 'Party register for SOP-001 to SOP-003',
        available: true,
      },
      {
        id: 'licences',
        title: 'Licences',
        to: '/licences',
        icon: 'licences',
        summary: 'Licence applications, verification, approval, sample receipts and issue.',
        sop: 'SOP-001 Licence issue',
        available: true,
      },
    ],
  },
  {
    label: 'Market floor',
    items: [
      {
        id: 'arrivals',
        title: 'Produce Arrivals',
        to: '/arrivals',
        icon: 'arrivals',
        summary: 'Gate arrivals, weighment, crates and lot movement.',
        sop: 'Gate recording used by SOP-002 and SOP-003',
        available: true,
      },
      {
        id: 'trading',
        title: 'Trading',
        to: '/trading',
        icon: 'trading',
        summary: 'Written sales, buyer requirements, parchis and fictional charges.',
        sop: 'SOP-002 Sales and SOP-003 Buying',
        available: true,
      },
    ],
  },
  {
    label: 'Accounts',
    items: [
      {
        id: 'finance',
        title: 'Finance',
        to: '/finance',
        icon: 'finance',
        summary: 'Simulated fees, security, notes and the sample-day close. No money moves.',
        sop: 'SOP-002 and SOP-003 settlement simulation',
        available: true,
      },
    ],
  },
  {
    label: 'Infrastructure',
    items: [
      {
        id: 'warehouses',
        title: 'Warehouses',
        to: '/warehouses',
        icon: 'warehouses',
        summary: 'Simulated contracts, stock and shed checks. No deed is signed.',
        sop: 'SOP-004 contract award and SOP-005 operations',
        available: true,
      },
      {
        id: 'cold-storage',
        title: 'Cold Storage',
        to: '/cold-storage',
        icon: 'cold-storage',
        summary: 'Simulated contracts, stock and chamber readings. No probe is connected.',
        sop: 'SOP-006 contract award and SOP-007 operations',
        available: true,
      },
      {
        id: 'post-harvest',
        title: 'Post-Harvest',
        to: '/post-harvest',
        icon: 'post-harvest',
        summary: 'Simulated intake, grading and output. No process is certified.',
        sop: 'SOP-008 post-harvest and FLP operations',
        available: true,
      },
      {
        id: 'parking',
        title: 'Parking & Transport',
        to: '/parking',
        icon: 'parking',
        summary: 'Simulated parking, entry passes and office leases. No fee is collected.',
        sop: 'SOP-009 parking contract, SOP-010 vehicle parking and SOP-011 transport office',
        available: true,
      },
      {
        id: 'facilities',
        title: 'Facilities & Leasing',
        to: '/facilities',
        icon: 'facilities',
        summary: 'Simulated Kisan Bhavan, hotel and restaurant leases. No deed is signed.',
        sop: 'SOP-012 to SOP-015 facility leasing and operations',
        available: true,
      },
    ],
  },
  {
    label: 'Governance',
    items: [
      {
        id: 'compliance',
        title: 'Compliance',
        to: '/compliance',
        icon: 'compliance',
        summary: 'Simulated 15-SOP matrix, incidents and audit. Not authoritative evidence.',
        sop: 'SOP-001 to SOP-015 command centre',
        available: true,
      },
      {
        id: 'reports',
        title: 'Reports',
        to: '/reports',
        icon: 'reports',
        summary: 'Demo CSV reports from the books in this browser. Not authoritative evidence.',
        sop: 'Cross-procedure reporting',
        available: true,
      },
      {
        id: 'settings',
        title: 'Settings',
        to: '/settings',
        icon: 'settings',
        summary: 'Theme, desk label and this browser’s demonstration data.',
        sop: 'Browser preferences',
        available: true,
      },
    ],
  },
]

export const navItems = navigation.flatMap((group) => group.items)

export function findNavItem(id: string) {
  return navItems.find((item) => item.id === id) ?? null
}

export function findNavItemByPath(pathname: string) {
  return navItems.find((item) => item.to === pathname) ?? null
}

export function findNavItemForPath(pathname: string) {
  const exact = findNavItemByPath(pathname)
  if (exact) return exact
  return (
    navItems
      .filter((item) => item.to !== '/' && pathname.startsWith(`${item.to}/`))
      .sort((left, right) => right.to.length - left.to.length)[0] ?? null
  )
}
