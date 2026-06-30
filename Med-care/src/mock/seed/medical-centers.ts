import type { MedicalCenter } from '@/types'
import { SEED_IDS } from './ids'

export let mockMedicalCenters: MedicalCenter[] = [
  {
    id: SEED_IDS.medicalCenters.clinicaSalud,
    name: 'Clínica Salud',
    type: 'clinic',
    address: null,
    phone: null,
    originGroupId: null,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    deletedAt: null,
  },
  {
    id: SEED_IDS.medicalCenters.hospitalCentral,
    name: 'Hospital Central',
    type: 'hospital',
    address: null,
    phone: null,
    originGroupId: null,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    deletedAt: null,
  },
  {
    id: SEED_IDS.medicalCenters.labAnalisis,
    name: 'Lab Análisis',
    type: 'laboratory',
    address: null,
    phone: null,
    originGroupId: null,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    deletedAt: null,
  },
]
