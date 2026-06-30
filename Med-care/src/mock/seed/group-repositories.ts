import type { GroupDoctor, GroupInsurer, GroupMedicalCenter, GroupPharmacy } from '@/types'
import { SEED_IDS } from './ids'

export let mockGroupDoctors: GroupDoctor[] = [
  {
    id: SEED_IDS.groupRepos.groupDoctors.gd001,
    groupId: SEED_IDS.groups.familiaGarcia,
    doctorId: SEED_IDS.doctors.drRamirez,
    isActive: true,
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: SEED_IDS.groupRepos.groupDoctors.gd002,
    groupId: SEED_IDS.groups.familiaGarcia,
    doctorId: SEED_IDS.doctors.draMendoza,
    isActive: true,
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: SEED_IDS.groupRepos.groupDoctors.gd003,
    groupId: SEED_IDS.groups.familiaGarcia,
    doctorId: SEED_IDS.doctors.drTorres,
    isActive: true,
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: SEED_IDS.groupRepos.groupDoctors.gd004,
    groupId: SEED_IDS.groups.familiaGarcia,
    doctorId: SEED_IDS.doctors.draVega,
    isActive: true,
    createdAt: '2026-01-15T00:00:00Z',
  },
]

export let mockGroupMedicalCenters: GroupMedicalCenter[] = [
  {
    id: SEED_IDS.groupRepos.groupMedicalCenters.gmc001,
    groupId: SEED_IDS.groups.familiaGarcia,
    medicalCenterId: SEED_IDS.medicalCenters.clinicaSalud,
    isActive: true,
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: SEED_IDS.groupRepos.groupMedicalCenters.gmc002,
    groupId: SEED_IDS.groups.familiaGarcia,
    medicalCenterId: SEED_IDS.medicalCenters.hospitalCentral,
    isActive: true,
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: SEED_IDS.groupRepos.groupMedicalCenters.gmc003,
    groupId: SEED_IDS.groups.familiaGarcia,
    medicalCenterId: SEED_IDS.medicalCenters.labAnalisis,
    isActive: true,
    createdAt: '2026-01-15T00:00:00Z',
  },
]

export let mockGroupInsurers: GroupInsurer[] = [
  {
    id: SEED_IDS.groupRepos.groupInsurers.gi001,
    groupId: SEED_IDS.groups.familiaGarcia,
    insurerId: SEED_IDS.insurers.rimac,
    isActive: true,
    createdAt: '2026-01-15T00:00:00Z',
  },
]

export let mockGroupPharmacies: GroupPharmacy[] = [
  {
    id: SEED_IDS.groupRepos.groupPharmacies.gp001,
    groupId: SEED_IDS.groups.familiaGarcia,
    pharmacyId: SEED_IDS.pharmacies.inkafarma,
    isActive: true,
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: SEED_IDS.groupRepos.groupPharmacies.gp002,
    groupId: SEED_IDS.groups.familiaGarcia,
    pharmacyId: SEED_IDS.pharmacies.mifarma,
    isActive: true,
    createdAt: '2026-01-15T00:00:00Z',
  },
]
