import { mockInsurers } from '@/mock'
import { APP_CONFIG } from '@/config/app.config'
import type { Insurer } from '@/types'

export interface InsurerCreateDTO {
  name: string
  emergencyPhone: string | null
  website: string | null
  logoUrl: string | null
}

export type InsurerUpdateDTO = InsurerCreateDTO

function simulateDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, APP_CONFIG.mock.simulatedDelayMs))
}

async function getAll(): Promise<Insurer[]> {
  await simulateDelay()
  return [...mockInsurers]
}

async function getById(id: string): Promise<Insurer> {
  await simulateDelay()
  const insurer = mockInsurers.find((i) => i.id === id)
  if (!insurer) throw new Error('Insurer not found')
  return insurer
}

async function create(data: InsurerCreateDTO): Promise<Insurer> {
  await simulateDelay()
  const now = new Date().toISOString()
  const insurer: Insurer = {
    id: crypto.randomUUID(),
    ...data,
    originGroupId: null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  }
  mockInsurers.push(insurer)
  return insurer
}

async function update(id: string, data: InsurerUpdateDTO): Promise<Insurer> {
  await simulateDelay()
  const insurer = mockInsurers.find((i) => i.id === id)
  if (!insurer) throw new Error('Insurer not found')
  Object.assign(insurer, data, { updatedAt: new Date().toISOString() })
  return insurer
}

async function deactivate(id: string): Promise<Insurer> {
  await simulateDelay()
  const insurer = mockInsurers.find((i) => i.id === id)
  if (!insurer) throw new Error('Insurer not found')
  insurer.isActive = false
  insurer.updatedAt = new Date().toISOString()
  return insurer
}

async function reactivate(id: string): Promise<Insurer> {
  await simulateDelay()
  const insurer = mockInsurers.find((i) => i.id === id)
  if (!insurer) throw new Error('Insurer not found')
  insurer.isActive = true
  insurer.updatedAt = new Date().toISOString()
  return insurer
}

export const insurersService = { getAll, getById, create, update, deactivate, reactivate }
