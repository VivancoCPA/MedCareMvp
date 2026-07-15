import {
  mockGroupDoctors,
  mockGroupMedicalCenters,
  mockGroupPharmacies,
  mockGroupInsurers,
  mockDoctors,
  mockMedicalCenters,
  mockPharmacies,
  mockInsurers,
} from '@/mock'
import { APP_CONFIG } from '@/config/app.config'
import type { Doctor, MedicalCenter, Pharmacy, Insurer, GroupDoctor, GroupMedicalCenter, GroupPharmacy, GroupInsurer } from '@/types'
import type { DoctorCreateDTO } from '@/features/repositories-universal/services/doctors.service'
import type { MedicalCenterCreateDTO } from '@/features/repositories-universal/services/medical-centers.service'
import type { PharmacyCreateDTO } from '@/features/repositories-universal/services/pharmacies.service'
import type { InsurerCreateDTO } from '@/features/repositories-universal/services/insurers.service'

export type GroupRepoEntityType = 'doctor' | 'medicalCenter' | 'pharmacy' | 'insurer'

type UniversalEntity = Doctor | MedicalCenter | Pharmacy | Insurer
type GroupRepoRow = GroupDoctor | GroupMedicalCenter | GroupPharmacy | GroupInsurer

export interface GroupRepositoryEntry {
  entryId: string
  entity: UniversalEntity
}

export type GroupOwnEntryData =
  | { entityType: 'doctor'; data: DoctorCreateDTO }
  | { entityType: 'medicalCenter'; data: MedicalCenterCreateDTO }
  | { entityType: 'pharmacy'; data: PharmacyCreateDTO }
  | { entityType: 'insurer'; data: InsurerCreateDTO }

function simulateDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, APP_CONFIG.mock.simulatedDelayMs))
}

function getUniversalArray(entityType: GroupRepoEntityType): UniversalEntity[] {
  switch (entityType) {
    case 'doctor':
      return mockDoctors
    case 'medicalCenter':
      return mockMedicalCenters
    case 'pharmacy':
      return mockPharmacies
    case 'insurer':
      return mockInsurers
  }
}

function getGroupArray(entityType: GroupRepoEntityType): GroupRepoRow[] {
  switch (entityType) {
    case 'doctor':
      return mockGroupDoctors
    case 'medicalCenter':
      return mockGroupMedicalCenters
    case 'pharmacy':
      return mockGroupPharmacies
    case 'insurer':
      return mockGroupInsurers
  }
}

function getEntityId(row: GroupRepoRow, entityType: GroupRepoEntityType): string {
  switch (entityType) {
    case 'doctor':
      return (row as GroupDoctor).doctorId
    case 'medicalCenter':
      return (row as GroupMedicalCenter).medicalCenterId
    case 'pharmacy':
      return (row as GroupPharmacy).pharmacyId
    case 'insurer':
      return (row as GroupInsurer).insurerId
  }
}

function buildGroupRow(entityType: GroupRepoEntityType, groupId: string, entityId: string): GroupRepoRow {
  const base = { id: crypto.randomUUID(), groupId, isActive: true, createdAt: new Date().toISOString() }
  switch (entityType) {
    case 'doctor':
      return { ...base, doctorId: entityId }
    case 'medicalCenter':
      return { ...base, medicalCenterId: entityId }
    case 'pharmacy':
      return { ...base, pharmacyId: entityId }
    case 'insurer':
      return { ...base, insurerId: entityId }
  }
}

function getEntityName(entity: UniversalEntity, entityType: GroupRepoEntityType): string {
  if (entityType === 'doctor') {
    const doctor = entity as Doctor
    return `${doctor.firstName} ${doctor.lastName}`
  }
  return (entity as MedicalCenter | Pharmacy | Insurer).name
}

async function getGroupRepository(groupId: string, entityType: GroupRepoEntityType): Promise<GroupRepositoryEntry[]> {
  await simulateDelay()
  const groupArray = getGroupArray(entityType)
  const universalArray = getUniversalArray(entityType)

  const entries: GroupRepositoryEntry[] = []
  for (const row of groupArray) {
    if (row.groupId !== groupId || !row.isActive) continue
    const entity = universalArray.find((e) => e.id === getEntityId(row, entityType))
    if (entity) entries.push({ entryId: row.id, entity })
  }
  return entries
}

async function getImportCandidates(groupId: string, entityType: GroupRepoEntityType): Promise<UniversalEntity[]> {
  await simulateDelay()
  const universalArray = getUniversalArray(entityType)
  const groupArray = getGroupArray(entityType)

  const activeEntityIdsInGroup = new Set(
    groupArray.filter((row) => row.groupId === groupId && row.isActive).map((row) => getEntityId(row, entityType))
  )

  return universalArray.filter((entity) => entity.isActive && !activeEntityIdsInGroup.has(entity.id))
}

async function importToGroupRepository(params: {
  groupId: string
  entityType: GroupRepoEntityType
  entityId: string
}): Promise<GroupRepositoryEntry> {
  await simulateDelay()
  const { groupId, entityType, entityId } = params
  const groupArray = getGroupArray(entityType)
  const universalArray = getUniversalArray(entityType)

  const entity = universalArray.find((e) => e.id === entityId)
  if (!entity) throw new Error('Entity not found')

  const existingRow = groupArray.find((row) => row.groupId === groupId && getEntityId(row, entityType) === entityId)
  if (existingRow) {
    existingRow.isActive = true
    return { entryId: existingRow.id, entity }
  }

  const newRow = buildGroupRow(entityType, groupId, entityId)
  groupArray.push(newRow)
  return { entryId: newRow.id, entity }
}

async function checkDuplicateByName(entityType: GroupRepoEntityType, name: string): Promise<UniversalEntity | null> {
  await simulateDelay()
  const term = name.trim().toLowerCase()
  if (!term) return null

  const universalArray = getUniversalArray(entityType)
  const match = universalArray.find((entity) => getEntityName(entity, entityType).trim().toLowerCase() === term)
  return match ?? null
}

async function createGroupOwnEntry(params: { groupId: string } & GroupOwnEntryData): Promise<GroupRepositoryEntry> {
  await simulateDelay()
  const { groupId } = params
  const now = new Date().toISOString()
  const id = crypto.randomUUID()

  let entity: UniversalEntity

  switch (params.entityType) {
    case 'doctor': {
      const doctor: Doctor = {
        id,
        ...params.data,
        medicalLicense: null,
        originGroupId: groupId,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      }
      mockDoctors.push(doctor)
      entity = doctor
      break
    }
    case 'medicalCenter': {
      const center: MedicalCenter = {
        id,
        ...params.data,
        originGroupId: groupId,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      }
      mockMedicalCenters.push(center)
      entity = center
      break
    }
    case 'pharmacy': {
      const pharmacy: Pharmacy = {
        id,
        ...params.data,
        originGroupId: groupId,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      }
      mockPharmacies.push(pharmacy)
      entity = pharmacy
      break
    }
    case 'insurer': {
      const insurer: Insurer = {
        id,
        ...params.data,
        originGroupId: groupId,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      }
      mockInsurers.push(insurer)
      entity = insurer
      break
    }
  }

  const row = buildGroupRow(params.entityType, groupId, id)
  getGroupArray(params.entityType).push(row)

  return { entryId: row.id, entity }
}

async function deactivateGroupRepositoryEntry(params: {
  groupId: string
  entityType: GroupRepoEntityType
  entryId: string
}): Promise<void> {
  await simulateDelay()
  const { groupId, entityType, entryId } = params
  const groupArray = getGroupArray(entityType)
  const row = groupArray.find((r) => r.id === entryId && r.groupId === groupId)
  if (!row) throw new Error('Group repository entry not found')
  row.isActive = false
}

export const groupRepositoriesService = {
  getGroupRepository,
  getImportCandidates,
  importToGroupRepository,
  checkDuplicateByName,
  createGroupOwnEntry,
  deactivateGroupRepositoryEntry,
}
