import { z } from 'zod'
import { t } from 'i18next'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: t('validation.required') })
    .email({ message: t('validation.email') }),
  password: z.string().min(1, { message: t('validation.required') }),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: t('validation.required') }),
    newPassword: z
      .string()
      .min(8, { message: t('validation.password.minLength') })
      .regex(/[A-Z]/, { message: t('validation.password.uppercase') })
      .regex(/[a-z]/, { message: t('validation.password.lowercase') })
      .regex(/[0-9]/, { message: t('validation.password.number') })
      .regex(/[^A-Za-z0-9]/, { message: t('validation.password.special') }),
    confirmPassword: z.string().min(1, { message: t('validation.required') }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: t('validation.password.mustMatch'),
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: t('validation.required') })
    .email({ message: t('validation.email') }),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
