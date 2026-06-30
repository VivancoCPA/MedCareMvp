import type { Group } from '@/types'
import { SEED_IDS } from './ids'

export let mockGroups: Group[] = [
  {
    id: SEED_IDS.groups.familiaGarcia,
    name: 'Familia García',
    adminId: SEED_IDS.users.adminGarcia,
    isActive: true,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
    deletedAt: null,
  },
  {
    id: SEED_IDS.groups.familiaLopez,
    name: 'Familia López',
    adminId: SEED_IDS.users.adminLopez,
    isActive: true,
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
    deletedAt: null,
  },
]
