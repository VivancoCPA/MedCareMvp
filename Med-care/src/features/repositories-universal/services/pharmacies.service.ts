import { mockPharmacies } from '@/mock'
import { APP_CONFIG } from '@/config/app.config'
import type { Pharmacy } from '@/types'

export interface PharmacyCreateDTO {
  name: string
  address: string | null
  phone: string | null
}

export type PharmacyUpdateDTO = PharmacyCreateDTO

function simulateDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, APP_CONFIG.mock.simulatedDelayMs))
}

async function getAll(): Promise<Pharmacy[]> {
  await simulateDelay()
  return [...mockPharmacies]
}

async function getById(id: string): Promise<Pharmacy> {
  await simulateDelay()
  const pharmacy = mockPharmacies.find((p) => p.id === id)
  if (!pharmacy) throw new Error('Pharmacy not found')
  return pharmacy
}

async function create(data: PharmacyCreateDTO): Promise<Pharmacy> {
  await simulateDelay()
  const now = new Date().toISOString()
  const pharmacy: Pharmacy = {
    id: crypto.randomUUID(),
    ...data,
    originGroupId: null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  }
  mockPharmacies.push(pharmacy)
  return pharmacy
}

async function update(id: string, data: PharmacyUpdateDTO): Promise<Pharmacy> {
  await simulateDelay()
  const pharmacy = mockPharmacies.find((p) => p.id === id)
  if (!pharmacy) throw new Error('Pharmacy not found')
  Object.assign(pharmacy, data, { updatedAt: new Date().toISOString() })
  return pharmacy
}

async function deactivate(id: string): Promise<Pharmacy> {
  await simulateDelay()
  const pharmacy = mockPharmacies.find((p) => p.id === id)
  if (!pharmacy) throw new Error('Pharmacy not found')
  pharmacy.isActive = false
  pharmacy.updatedAt = new Date().toISOString()
  return pharmacy
}

async function reactivate(id: string): Promise<Pharmacy> {
  await simulateDelay()
  const pharmacy = mockPharmacies.find((p) => p.id === id)
  if (!pharmacy) throw new Error('Pharmacy not found')
  pharmacy.isActive = true
  pharmacy.updatedAt = new Date().toISOString()
  return pharmacy
}

export const pharmaciesService = { getAll, getById, create, update, deactivate, reactivate }
