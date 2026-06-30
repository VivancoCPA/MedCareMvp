import { mockUsers } from '@/mock'
import { APP_CONFIG } from '@/config/app.config'
import type { User } from '@/types'

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_DISABLED'
  | 'INVALID_CURRENT_PASSWORD'
  | 'SAME_AS_CURRENT'

export class AuthError extends Error {
  readonly code: AuthErrorCode
  constructor(code: AuthErrorCode) {
    super(code)
    this.code = code
    this.name = 'AuthError'
  }
}

function simulateDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, APP_CONFIG.mock.simulatedDelayMs))
}

async function login(
  email: string,
  password: string
): Promise<{ user: User; mustChangePassword: boolean }> {
  await simulateDelay()
  const user = mockUsers.find((u) => u.email === email)
  if (!user || user.passwordHash !== password) {
    throw new AuthError('INVALID_CREDENTIALS')
  }
  if (!user.isActive) {
    throw new AuthError('ACCOUNT_DISABLED')
  }
  return { user, mustChangePassword: user.mustChangePassword }
}

async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  await simulateDelay()
  const user = mockUsers.find((u) => u.id === userId)
  if (!user || user.passwordHash !== currentPassword) {
    throw new AuthError('INVALID_CURRENT_PASSWORD')
  }
  if (newPassword === currentPassword) {
    throw new AuthError('SAME_AS_CURRENT')
  }
  user.passwordHash = newPassword
  user.mustChangePassword = false
}

async function requestPasswordReset(_email: string): Promise<{ sent: true }> {
  await simulateDelay()
  return { sent: true }
}

function getDevUsers() {
  return mockUsers.map(({ id, email, passwordHash, firstName, lastName, role }) => ({
    id,
    email,
    passwordHash,
    firstName,
    lastName,
    role,
  }))
}

export const authService = { login, changePassword, requestPasswordReset, getDevUsers }
