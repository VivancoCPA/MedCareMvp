import { z } from 'zod'
import { t } from 'i18next'

export const nonAccountMemberSchema = z.object({
  firstName: z.string().min(2, { message: t('validation.minLength', { min: 2 }) }),
  lastName: z.string().nullable(),
  memberType: z.enum(['human', 'pet', 'other']),
  birthDate: z.string().nullable(),
  gender: z.enum(['male', 'female', 'other', 'unspecified']),
  breed: z.string().nullable(),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']).nullable().optional(),
  avatarUrl: z.string().nullable(),
})

export type NonAccountMemberFormValues = z.infer<typeof nonAccountMemberSchema>
