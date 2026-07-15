import { z } from 'zod'
import { t } from 'i18next'

export const doctorSchema = z.object({
  firstName: z.string().min(1, { message: t('validation.required') }),
  lastName: z.string().min(1, { message: t('validation.required') }),
  specialtyId: z.string().min(1, { message: t('validation.required') }),
  phone: z.string().optional(),
  email: z
    .string()
    .email({ message: t('validation.email') })
    .optional()
    .or(z.literal('')),
  avatarUrl: z.string().nullable().optional(),
})

export type DoctorFormValues = z.infer<typeof doctorSchema>
