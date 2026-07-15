import { z } from 'zod'

export const importSelectionSchema = z.object({
  selectedIds: z.array(z.string()).min(1),
})

export type ImportSelectionFormValues = z.infer<typeof importSelectionSchema>
