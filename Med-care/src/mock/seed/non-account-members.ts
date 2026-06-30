import type { NonAccountMember } from '@/types'
import { SEED_IDS } from './ids'

export let mockNonAccountMembers: NonAccountMember[] = [
  {
    id: SEED_IDS.nonAccount.sofiaGarcia,
    groupId: SEED_IDS.groups.familiaGarcia,
    firstName: 'Sofía',
    lastName: 'García',
    birthDate: '2018-06-12T00:00:00Z',
    gender: 'female',
    memberType: 'human',
    breed: null,
    bloodType: 'A+',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
    deletedAt: null,
  },
  {
    id: SEED_IDS.nonAccount.maxGarcia,
    groupId: SEED_IDS.groups.familiaGarcia,
    firstName: 'Max',
    lastName: null,
    birthDate: '2021-03-01T00:00:00Z',
    gender: 'male',
    memberType: 'pet',
    breed: 'Labrador',
    bloodType: null,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
    deletedAt: null,
  },
]
