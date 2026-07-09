import { z } from 'zod'
import { t } from 'i18next'

export const specialtySchema = z.object({
  name: z.string().min(1, { message: t('validation.required') }),
  description: z.string().optional(),
})

export type SpecialtyFormValues = z.infer<typeof specialtySchema>
