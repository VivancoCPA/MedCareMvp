import type { GroupMember } from '@/types'
import { SEED_IDS } from './ids'

export let mockGroupMembers: GroupMember[] = [
  {
    id: SEED_IDS.groupMembers.gm001,
    groupId: SEED_IDS.groups.familiaGarcia,
    userId: SEED_IDS.users.adminGarcia,
    isActive: true,
    joinedAt: '2026-01-15T00:00:00Z',
    leftAt: null,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: SEED_IDS.groupMembers.gm002,
    groupId: SEED_IDS.groups.familiaLopez,
    userId: SEED_IDS.users.adminLopez,
    isActive: true,
    joinedAt: '2026-01-20T00:00:00Z',
    leftAt: null,
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
  },
  {
    id: SEED_IDS.groupMembers.gm003,
    groupId: SEED_IDS.groups.familiaGarcia,
    userId: SEED_IDS.users.memberMaria,
    isActive: true,
    joinedAt: '2026-01-16T00:00:00Z',
    leftAt: null,
    createdAt: '2026-01-16T00:00:00Z',
    updatedAt: '2026-01-16T00:00:00Z',
  },
  {
    id: SEED_IDS.groupMembers.gm004,
    groupId: SEED_IDS.groups.familiaGarcia,
    userId: SEED_IDS.users.memberCarlos,
    isActive: true,
    joinedAt: '2026-02-01T00:00:00Z',
    leftAt: null,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
]
