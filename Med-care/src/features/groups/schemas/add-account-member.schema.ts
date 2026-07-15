import { z } from 'zod'
import { t } from 'i18next'

export const addAccountMemberSchema = z.object({
  email: z
    .string()
    .min(1, { message: t('validation.required') })
    .email({ message: t('validation.email') }),
})

export type AddAccountMemberFormValues = z.infer<typeof addAccountMemberSchema>
