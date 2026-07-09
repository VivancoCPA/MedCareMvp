import { z } from 'zod'
import { t } from 'i18next'

export const medicalCenterTypeValues = ['clinic', 'hospital', 'office', 'laboratory', 'other'] as const

export const medicalCenterSchema = z.object({
  name: z.string().min(1, { message: t('validation.required') }),
  type: z
    .string()
    .min(1, { message: t('validation.required') })
    .refine((val) => (medicalCenterTypeValues as readonly string[]).includes(val), {
      message: t('validation.required'),
    }),
  address: z.string().optional(),
  phone: z.string().optional(),
})

export type MedicalCenterFormValues = z.infer<typeof medicalCenterSchema>
