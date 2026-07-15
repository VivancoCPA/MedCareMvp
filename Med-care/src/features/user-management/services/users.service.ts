import { mockUsers, mockGroups, mockGroupMembers } from '@/mock'
import { APP_CONFIG } from '@/config/app.config'
import type { User, UserRole, Gender } from '@/types'

export interface CreateUserDTO {
  email: string
  firstName: string
  lastName: string
  birthDate: string
  gender: Gender
  phone: string | null
  role: UserRole
  avatarUrl: string | null
  originAdminId: string | null
}

export interface UpdateUserDTO {
  firstName: string
  lastName: string
  birthDate: string
  gender: Gender
  phone: string | null
  avatarUrl: string | null
  email?: string
  role?: UserRole
}

export type UserErrorCode = 'EMAIL_TAKEN'

export class UserError extends Error {
  readonly code: UserErrorCode
  constructor(code: UserErrorCode) {
    super(code)
    this.code = code
    this.name = 'UserError'
  }
}

function simulateDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, APP_CONFIG.mock.simulatedDelayMs))
}

function isEmailTaken(email: string, excludeId?: string): boolean {
  return mockUsers.some((u) => u.email === email && u.id !== excludeId && !u.deletedAt)
}

function generateTempPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghijkmnpqrstuvwxyz'
  const numbers = '23456789'
  const special = '!@#$%^&*'
  const pick = (chars: string) => chars[Math.floor(Math.random() * chars.length)]!
  const all = upper + lower + numbers + special
  const required = [pick(upper), pick(lower), pick(numbers), pick(special)]
  const rest = Array.from({ length: 4 }, () => pick(all))
  return [...required, ...rest].sort(() => Math.random() - 0.5).join('')
}

async function getAll(): Promise<User[]> {
  await simulateDelay()
  return [...mockUsers]
}

async function getById(id: string): Promise<User> {
  await simulateDelay()
  const user = mockUsers.find((u) => u.id === id)
  if (!user) throw new Error('User not found')
  return user
}

async function create(data: CreateUserDTO): Promise<User> {
  await simulateDelay()
  if (isEmailTaken(data.email)) throw new UserError('EMAIL_TAKEN')
  const now = new Date().toISOString()
  const user: User = {
    id: crypto.randomUUID(),
    email: data.email,
    passwordHash: generateTempPassword(),
    mustChangePassword: true,
    firstName: data.firstName,
    lastName: data.lastName,
    birthDate: data.birthDate,
    gender: data.gender,
    phone: data.phone,
    role: data.role,
    isActive: true,
    avatarUrl: data.avatarUrl,
    originAdminId: data.originAdminId,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  }
  mockUsers.push(user)
  return user
}

async function update(id: string, data: UpdateUserDTO): Promise<User> {
  await simulateDelay()
  const user = mockUsers.find((u) => u.id === id)
  if (!user) throw new Error('User not found')
  if (data.email && isEmailTaken(data.email, id)) throw new UserError('EMAIL_TAKEN')
  Object.assign(user, data, { updatedAt: new Date().toISOString() })
  return user
}

async function deactivate(id: string): Promise<User> {
  await simulateDelay()
  const user = mockUsers.find((u) => u.id === id)
  if (!user) throw new Error('User not found')
  user.isActive = false
  user.updatedAt = new Date().toISOString()
  return user
}

async function reactivate(id: string): Promise<User> {
  await simulateDelay()
  const user = mockUsers.find((u) => u.id === id)
  if (!user) throw new Error('User not found')
  user.isActive = true
  user.updatedAt = new Date().toISOString()
  return user
}

function getGroupName(groupId: string | null): string | null {
  if (!groupId) return null
  return mockGroups.find((g) => g.id === groupId)?.name ?? null
}

function getGroupNamesForUser(userId: string): string[] {
  const groupIds = mockGroupMembers.filter((gm) => gm.userId === userId && gm.isActive).map((gm) => gm.groupId)
  return groupIds
    .map((groupId) => mockGroups.find((g) => g.id === groupId)?.name)
    .filter((name): name is string => !!name)
}

async function getVisibleForAdmin(adminId: string): Promise<User[]> {
  await simulateDelay()
  return mockUsers.filter(
    (u) => !u.deletedAt && u.role !== 'superadmin' && (u.originAdminId === adminId || u.originAdminId === null)
  )
}

export const usersService = {
  getAll,
  getById,
  create,
  update,
  deactivate,
  reactivate,
  getGroupName,
  getGroupNamesForUser,
  getVisibleForAdmin,
}
