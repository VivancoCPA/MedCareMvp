import type { MemberType, NonAccountMember, User } from '@/types'

export function resolveMember(
  memberId: string,
  memberType: MemberType,
  users: User[],
  nonAccountMembers: NonAccountMember[]
): User | NonAccountMember {
  if (memberType === 'user') {
    const user = users.find((u) => u.id === memberId)
    if (!user) throw new Error(`User not found: ${memberId}`)
    return user
  }
  const member = nonAccountMembers.find((m) => m.id === memberId)
  if (!member) throw new Error(`NonAccountMember not found: ${memberId}`)
  return member
}
