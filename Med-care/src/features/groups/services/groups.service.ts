import { mockGroups, mockGroupMembers, mockNonAccountMembers, mockHealthProfiles, mockUsers } from '@/mock'
import { usersService } from '@/features/user-management/services/users.service'
import { APP_CONFIG } from '@/config/app.config'
import type { Group, NonAccountMember, User, MemberType, Gender, NonAccountMemberType, BloodType } from '@/types'

export type GroupErrorCode =
  | 'ALREADY_IN_GROUP'
  | 'ALREADY_IN_ANOTHER_GROUP'
  | 'USER_NOT_FOUND'
  | 'CANNOT_REMOVE_SELF_AS_ADMIN'

export class GroupError extends Error {
  readonly code: GroupErrorCode
  constructor(code: GroupErrorCode) {
    super(code)
    this.code = code
    this.name = 'GroupError'
  }
}

function simulateDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, APP_CONFIG.mock.simulatedDelayMs))
}

function ensureHealthProfile(params: {
  groupId: string
  memberId: string
  memberType: MemberType
  bloodType: BloodType | null
}): void {
  const exists = mockHealthProfiles.some(
    (hp) => hp.memberId === params.memberId && hp.memberType === params.memberType && !hp.deletedAt
  )
  if (exists) return
  const now = new Date().toISOString()
  mockHealthProfiles.push({
    id: crypto.randomUUID(),
    groupId: params.groupId,
    memberId: params.memberId,
    memberType: params.memberType,
    bloodType: params.bloodType,
    allergies: [],
    chronicConditions: [],
    permanentMedications: [],
    notes: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  })
}

function isAvailableForGroup(userId: string, targetGroupId: string): boolean {
  const activeMemberships = mockGroupMembers.filter((gm) => gm.userId === userId && gm.isActive)
  if (activeMemberships.some((gm) => gm.groupId === targetGroupId)) return false

  const targetGroup = mockGroups.find((g) => g.id === targetGroupId)
  if (targetGroup?.adminId === userId) return true

  return !activeMemberships.some((gm) => {
    const group = mockGroups.find((g) => g.id === gm.groupId)
    return group?.adminId !== userId
  })
}

async function getGroupsAdministeredBy(adminId: string): Promise<Group[]> {
  await simulateDelay()
  return mockGroups.filter((g) => g.adminId === adminId && !g.deletedAt)
}

interface CreateGroupParams {
  name: string
  userId: string
  avatarUrl?: string | null
}

async function createGroup({ name, userId, avatarUrl }: CreateGroupParams): Promise<{ group: Group; user: User }> {
  await simulateDelay()
  const user = mockUsers.find((u) => u.id === userId)
  if (!user) throw new GroupError('USER_NOT_FOUND')

  const now = new Date().toISOString()

  const group: Group = {
    id: crypto.randomUUID(),
    name,
    adminId: userId,
    isActive: true,
    avatarUrl: avatarUrl ?? null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  }
  mockGroups.push(group)

  mockGroupMembers.push({
    id: crypto.randomUUID(),
    groupId: group.id,
    userId,
    isActive: true,
    joinedAt: now,
    leftAt: null,
    createdAt: now,
    updatedAt: now,
  })

  if (user.role !== 'admin') {
    user.role = 'admin'
    user.updatedAt = now
  }

  ensureHealthProfile({ groupId: group.id, memberId: user.id, memberType: 'user', bloodType: null })

  return { group, user }
}

interface AddAccountMemberParams {
  groupId: string
  email: string
}

async function addAccountMember({ groupId, email }: AddAccountMemberParams): Promise<User> {
  await simulateDelay()
  const user = mockUsers.find((u) => u.email === email && !u.deletedAt)
  if (!user) throw new GroupError('USER_NOT_FOUND')

  const now = new Date().toISOString()
  const existingRow = mockGroupMembers.find((gm) => gm.groupId === groupId && gm.userId === user.id)
  if (existingRow?.isActive) throw new GroupError('ALREADY_IN_GROUP')
  if (!isAvailableForGroup(user.id, groupId)) throw new GroupError('ALREADY_IN_ANOTHER_GROUP')

  if (existingRow) {
    existingRow.isActive = true
    existingRow.leftAt = null
    existingRow.updatedAt = now
  } else {
    mockGroupMembers.push({
      id: crypto.randomUUID(),
      groupId,
      userId: user.id,
      isActive: true,
      joinedAt: now,
      leftAt: null,
      createdAt: now,
      updatedAt: now,
    })
  }

  ensureHealthProfile({ groupId, memberId: user.id, memberType: 'user', bloodType: null })
  return user
}

interface CreateAccountMemberParams {
  groupId: string
  adminId: string
  email: string
  firstName: string
  lastName: string
  birthDate: string
  gender: Gender
  phone: string | null
  avatarUrl: string | null
}

async function createAccountMember(params: CreateAccountMemberParams): Promise<User> {
  const user = await usersService.create({
    email: params.email,
    firstName: params.firstName,
    lastName: params.lastName,
    birthDate: params.birthDate,
    gender: params.gender,
    phone: params.phone,
    role: 'member',
    avatarUrl: params.avatarUrl,
    originAdminId: params.adminId,
  })

  const now = new Date().toISOString()
  mockGroupMembers.push({
    id: crypto.randomUUID(),
    groupId: params.groupId,
    userId: user.id,
    isActive: true,
    joinedAt: now,
    leftAt: null,
    createdAt: now,
    updatedAt: now,
  })

  ensureHealthProfile({ groupId: params.groupId, memberId: user.id, memberType: 'user', bloodType: null })
  return user
}

interface AddNonAccountMemberParams {
  groupId: string
  firstName: string
  lastName: string | null
  memberType: NonAccountMemberType
  birthDate: string | null
  gender: Gender
  breed: string | null
  bloodType: BloodType | null
  avatarUrl: string | null
}

async function addNonAccountMember(params: AddNonAccountMemberParams): Promise<NonAccountMember> {
  await simulateDelay()
  const now = new Date().toISOString()
  const member: NonAccountMember = {
    id: crypto.randomUUID(),
    groupId: params.groupId,
    firstName: params.firstName,
    lastName: params.lastName,
    birthDate: params.birthDate,
    gender: params.gender,
    memberType: params.memberType,
    breed: params.breed,
    bloodType: params.bloodType,
    avatarUrl: params.avatarUrl,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  }
  mockNonAccountMembers.push(member)
  ensureHealthProfile({
    groupId: params.groupId,
    memberId: member.id,
    memberType: 'nonAccount',
    bloodType: params.bloodType,
  })
  return member
}

interface UpdateNonAccountMemberParams {
  memberId: string
  firstName: string
  lastName: string | null
  memberType: NonAccountMemberType
  birthDate: string | null
  gender: Gender
  breed: string | null
  bloodType: BloodType | null
  avatarUrl: string | null
}

async function updateNonAccountMember(params: UpdateNonAccountMemberParams): Promise<NonAccountMember> {
  await simulateDelay()
  const index = mockNonAccountMembers.findIndex((m) => m.id === params.memberId)
  if (index === -1) throw new Error('Member not found')
  const updated: NonAccountMember = {
    ...mockNonAccountMembers[index],
    firstName: params.firstName,
    lastName: params.lastName,
    memberType: params.memberType,
    birthDate: params.birthDate,
    gender: params.gender,
    breed: params.breed,
    bloodType: params.bloodType,
    avatarUrl: params.avatarUrl,
    updatedAt: new Date().toISOString(),
  }
  mockNonAccountMembers[index] = updated
  return updated
}

interface RemoveMemberParams {
  groupId: string
  memberId: string
  memberType: MemberType
}

async function removeMember({ groupId, memberId, memberType }: RemoveMemberParams): Promise<void> {
  await simulateDelay()
  const group = mockGroups.find((g) => g.id === groupId)
  if (!group) throw new Error('Group not found')
  if (memberType === 'user' && memberId === group.adminId) {
    throw new GroupError('CANNOT_REMOVE_SELF_AS_ADMIN')
  }

  const now = new Date().toISOString()
  if (memberType === 'user') {
    const membership = mockGroupMembers.find((gm) => gm.groupId === groupId && gm.userId === memberId && gm.isActive)
    if (!membership) throw new Error('Membership not found')
    membership.isActive = false
    membership.leftAt = now
    membership.updatedAt = now
  } else {
    const member = mockNonAccountMembers.find((m) => m.id === memberId)
    if (!member) throw new Error('Member not found')
    member.deletedAt = now
    member.updatedAt = now
  }
}

async function getGroupMembers(groupId: string): Promise<Array<User | NonAccountMember>> {
  await simulateDelay()
  const activeUserIds = new Set(
    mockGroupMembers.filter((gm) => gm.groupId === groupId && gm.isActive).map((gm) => gm.userId)
  )
  const users = mockUsers.filter((u) => activeUserIds.has(u.id) && !u.deletedAt)
  const nonAccountMembers = mockNonAccountMembers.filter((m) => m.groupId === groupId && !m.deletedAt)
  return [...users, ...nonAccountMembers]
}

async function getGroup(groupId: string): Promise<Group> {
  await simulateDelay()
  const group = mockGroups.find((g) => g.id === groupId)
  if (!group) throw new Error('Group not found')
  return group
}

function replaceGroup(groupId: string, patch: Partial<Group>): Group {
  const index = mockGroups.findIndex((g) => g.id === groupId)
  if (index === -1) throw new Error('Group not found')
  const updated: Group = { ...mockGroups[index], ...patch, updatedAt: new Date().toISOString() }
  mockGroups[index] = updated
  return updated
}

async function deactivateGroup(groupId: string): Promise<Group> {
  await simulateDelay()
  return replaceGroup(groupId, { isActive: false })
}

async function reactivateGroup(groupId: string): Promise<Group> {
  await simulateDelay()
  return replaceGroup(groupId, { isActive: true })
}

interface UpdateGroupParams {
  name?: string
  avatarUrl?: string | null
}

async function updateGroup(groupId: string, data: UpdateGroupParams): Promise<Group> {
  await simulateDelay()
  return replaceGroup(groupId, data)
}

async function getAvailableAccountMembers(groupId: string, adminId: string): Promise<User[]> {
  const visible = await usersService.getVisibleForAdmin(adminId)
  return visible.filter((u) => isAvailableForGroup(u.id, groupId))
}

export const groupsService = {
  createGroup,
  getGroupsAdministeredBy,
  addAccountMember,
  createAccountMember,
  addNonAccountMember,
  updateNonAccountMember,
  removeMember,
  getGroupMembers,
  getGroup,
  deactivateGroup,
  reactivateGroup,
  updateGroup,
  getAvailableAccountMembers,
}
