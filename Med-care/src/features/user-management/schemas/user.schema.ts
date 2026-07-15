import { z } from 'zod'
import { t } from 'i18next'

const sharedFields = {
  firstName: z.string().min(2, { message: t('validation.minLength', { min: 2 }) }),
  lastName: z.string().min(2, { message: t('validation.minLength', { min: 2 }) }),
  birthDate: z.string().min(1, { message: t('validation.required') }),
  gender: z.enum(['male', 'female', 'other', 'unspecified']),
  phone: z.string().optional(),
  avatarUrl: z.string().nullable().optional(),
}

export const createUserSchema = z.object({
  ...sharedFields,
  email: z
    .string()
    .min(1, { message: t('validation.required') })
    .email({ message: t('validation.email') }),
  role: z.enum(['superadmin', 'admin', 'member']),
})

export const updateUserSuperAdminSchema = z.object({
  ...sharedFields,
  email: z
    .string()
    .min(1, { message: t('validation.required') })
    .email({ message: t('validation.email') }),
  role: z.enum(['superadmin', 'admin', 'member']),
})

export const updateUserAdminSchema = z.object(sharedFields)

export type CreateUserFormValues = z.infer<typeof createUserSchema>
export type UpdateUserSAFormValues = z.infer<typeof updateUserSuperAdminSchema>
export type UpdateUserAdminFormValues = z.infer<typeof updateUserAdminSchema>
