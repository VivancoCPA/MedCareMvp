import type { Pharmacy } from '@/types'
import { SEED_IDS } from './ids'

export let mockPharmacies: Pharmacy[] = [
  {
    id: SEED_IDS.pharmacies.inkafarma,
    name: 'Inkafarma',
    address: null,
    phone: null,
    originGroupId: null,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    deletedAt: null,
  },
  {
    id: SEED_IDS.pharmacies.mifarma,
    name: 'MiFarma',
    address: null,
    phone: null,
    originGroupId: null,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    deletedAt: null,
  },
]
