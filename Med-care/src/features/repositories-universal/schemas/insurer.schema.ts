import { z } from 'zod'
import { t } from 'i18next'

export const insurerSchema = z.object({
  name: z.string().min(1, { message: t('validation.required') }),
  emergencyPhone: z.string().optional(),
  website: z
    .string()
    .url({ message: t('validation.invalidUrl') })
    .optional()
    .or(z.literal('')),
  logoUrl: z.string().nullable().optional(),
})

export type InsurerFormValues = z.infer<typeof insurerSchema>
