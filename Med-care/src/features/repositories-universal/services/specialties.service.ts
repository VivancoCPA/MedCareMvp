import { mockSpecialties } from '@/mock'
import { APP_CONFIG } from '@/config/app.config'
import type { Specialty } from '@/types'

export interface SpecialtyCreateDTO {
  name: string
  description: string | null
}

export type SpecialtyUpdateDTO = SpecialtyCreateDTO

function simulateDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, APP_CONFIG.mock.simulatedDelayMs))
}

async function getAll(): Promise<Specialty[]> {
  await simulateDelay()
  return [...mockSpecialties]
}

async function getById(id: string): Promise<Specialty> {
  await simulateDelay()
  const specialty = mockSpecialties.find((s) => s.id === id)
  if (!specialty) throw new Error('Specialty not found')
  return specialty
}

async function create(data: SpecialtyCreateDTO): Promise<Specialty> {
  await simulateDelay()
  const now = new Date().toISOString()
  const specialty: Specialty = {
    id: crypto.randomUUID(),
    ...data,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  }
  mockSpecialties.push(specialty)
  return specialty
}

async function update(id: string, data: SpecialtyUpdateDTO): Promise<Specialty> {
  await simulateDelay()
  const specialty = mockSpecialties.find((s) => s.id === id)
  if (!specialty) throw new Error('Specialty not found')
  Object.assign(specialty, data, { updatedAt: new Date().toISOString() })
  return specialty
}

async function deactivate(id: string): Promise<Specialty> {
  await simulateDelay()
  const specialty = mockSpecialties.find((s) => s.id === id)
  if (!specialty) throw new Error('Specialty not found')
  specialty.isActive = false
  specialty.updatedAt = new Date().toISOString()
  return specialty
}

async function reactivate(id: string): Promise<Specialty> {
  await simulateDelay()
  const specialty = mockSpecialties.find((s) => s.id === id)
  if (!specialty) throw new Error('Specialty not found')
  specialty.isActive = true
  specialty.updatedAt = new Date().toISOString()
  return specialty
}

export const specialtiesService = { getAll, getById, create, update, deactivate, reactivate }
