import type { HealthProfile, MemberType, PermanentMedication } from '@/types'

export function getActiveMedications(
  memberId: string,
  memberType: MemberType,
  healthProfiles: HealthProfile[]
): PermanentMedication[] {
  const profile = healthProfiles.find(
    (p) => p.memberId === memberId && p.memberType === memberType
  )
  if (!profile) return []
  return profile.permanentMedications
}
