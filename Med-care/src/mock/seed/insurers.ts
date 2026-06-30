import type { Insurer } from '@/types'
import { SEED_IDS } from './ids'

export let mockInsurers: Insurer[] = [
  {
    id: SEED_IDS.insurers.rimac,
    name: 'Rímac',
    phone: null,
    website: null,
    originGroupId: null,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    deletedAt: null,
  },
  {
    id: SEED_IDS.insurers.pacifico,
    name: 'Pacífico',
    phone: null,
    website: null,
    originGroupId: null,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    deletedAt: null,
  },
]
