import { z } from 'zod'
import { t } from 'i18next'

export const createAccountMemberSchema = z.object({
  firstName: z.string().min(2, { message: t('validation.minLength', { min: 2 }) }),
  lastName: z.string().min(2, { message: t('validation.minLength', { min: 2 }) }),
  email: z
    .string()
    .min(1, { message: t('validation.required') })
    .email({ message: t('validation.email') }),
  birthDate: z.string().min(1, { message: t('validation.required') }),
  gender: z.enum(['male', 'female', 'other', 'unspecified']),
  phone: z.string().optional(),
  avatarUrl: z.string().nullable().optional(),
})

export type CreateAccountMemberFormValues = z.infer<typeof createAccountMemberSchema>
