import { mockMedicalCenters } from '@/mock'
import { APP_CONFIG } from '@/config/app.config'
import type { MedicalCenter } from '@/types'

export interface MedicalCenterCreateDTO {
  name: string
  type: MedicalCenter['type']
  address: string | null
  phone: string | null
}

export type MedicalCenterUpdateDTO = MedicalCenterCreateDTO

function simulateDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, APP_CONFIG.mock.simulatedDelayMs))
}

async function getAll(): Promise<MedicalCenter[]> {
  await simulateDelay()
  return [...mockMedicalCenters]
}

async function getById(id: string): Promise<MedicalCenter> {
  await simulateDelay()
  const center = mockMedicalCenters.find((c) => c.id === id)
  if (!center) throw new Error('Medical center not found')
  return center
}

async function create(data: MedicalCenterCreateDTO): Promise<MedicalCenter> {
  await simulateDelay()
  const now = new Date().toISOString()
  const center: MedicalCenter = {
    id: crypto.randomUUID(),
    ...data,
    originGroupId: null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  }
  mockMedicalCenters.push(center)
  return center
}

async function update(id: string, data: MedicalCenterUpdateDTO): Promise<MedicalCenter> {
  await simulateDelay()
  const center = mockMedicalCenters.find((c) => c.id === id)
  if (!center) throw new Error('Medical center not found')
  Object.assign(center, data, { updatedAt: new Date().toISOString() })
  return center
}

async function deactivate(id: string): Promise<MedicalCenter> {
  await simulateDelay()
  const center = mockMedicalCenters.find((c) => c.id === id)
  if (!center) throw new Error('Medical center not found')
  center.isActive = false
  center.updatedAt = new Date().toISOString()
  return center
}

async function reactivate(id: string): Promise<MedicalCenter> {
  await simulateDelay()
  const center = mockMedicalCenters.find((c) => c.id === id)
  if (!center) throw new Error('Medical center not found')
  center.isActive = true
  center.updatedAt = new Date().toISOString()
  return center
}

export const medicalCentersService = { getAll, getById, create, update, deactivate, reactivate }
