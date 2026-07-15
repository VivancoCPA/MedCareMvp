import { z } from 'zod'
import { t } from 'i18next'

export const createGroupSchema = z.object({
  name: z
    .string()
    .min(2, { message: t('validation.minLength', { min: 2 }) })
    .max(80),
  avatarUrl: z.string().nullable().optional(),
})

export type CreateGroupFormValues = z.infer<typeof createGroupSchema>

export const editGroupSchema = createGroupSchema.extend({
  avatarUrl: z.string().nullable(),
})

export type EditGroupFormValues = z.infer<typeof editGroupSchema>
