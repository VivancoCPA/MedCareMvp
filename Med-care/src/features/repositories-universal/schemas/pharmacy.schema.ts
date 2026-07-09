import { z } from 'zod'
import { t } from 'i18next'

export const pharmacySchema = z.object({
  name: z.string().min(1, { message: t('validation.required') }),
  address: z.string().optional(),
  phone: z.string().optional(),
})

export type PharmacyFormValues = z.infer<typeof pharmacySchema>
