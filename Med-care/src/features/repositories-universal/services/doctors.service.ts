import { mockDoctors } from '@/mock'
import { APP_CONFIG } from '@/config/app.config'
import type { Doctor } from '@/types'

export interface DoctorCreateDTO {
  firstName: string
  lastName: string
  specialtyId: string
  phone: string | null
  email: string | null
  avatarUrl: string | null
}

export type DoctorUpdateDTO = DoctorCreateDTO

function simulateDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, APP_CONFIG.mock.simulatedDelayMs))
}

async function getAll(): Promise<Doctor[]> {
  await simulateDelay()
  return [...mockDoctors]
}

async function getById(id: string): Promise<Doctor> {
  await simulateDelay()
  const doctor = mockDoctors.find((d) => d.id === id)
  if (!doctor) throw new Error('Doctor not found')
  return doctor
}

async function create(data: DoctorCreateDTO): Promise<Doctor> {
  await simulateDelay()
  const now = new Date().toISOString()
  const doctor: Doctor = {
    id: crypto.randomUUID(),
    ...data,
    medicalLicense: null,
    originGroupId: null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  }
  mockDoctors.push(doctor)
  return doctor
}

async function update(id: string, data: DoctorUpdateDTO): Promise<Doctor> {
  await simulateDelay()
  const doctor = mockDoctors.find((d) => d.id === id)
  if (!doctor) throw new Error('Doctor not found')
  Object.assign(doctor, data, { updatedAt: new Date().toISOString() })
  return doctor
}

async function deactivate(id: string): Promise<Doctor> {
  await simulateDelay()
  const doctor = mockDoctors.find((d) => d.id === id)
  if (!doctor) throw new Error('Doctor not found')
  doctor.isActive = false
  doctor.updatedAt = new Date().toISOString()
  return doctor
}

async function reactivate(id: string): Promise<Doctor> {
  await simulateDelay()
  const doctor = mockDoctors.find((d) => d.id === id)
  if (!doctor) throw new Error('Doctor not found')
  doctor.isActive = true
  doctor.updatedAt = new Date().toISOString()
  return doctor
}

export const doctorsService = { getAll, getById, create, update, deactivate, reactivate }
