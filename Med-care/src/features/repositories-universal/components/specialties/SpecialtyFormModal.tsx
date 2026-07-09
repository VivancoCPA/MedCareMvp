import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { specialtySchema, type SpecialtyFormValues } from '../../schemas/specialty.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import type { Specialty } from '@/types'

interface SpecialtyFormModalProps {
  open: boolean
  specialty?: Specialty | null
  onClose: () => void
  onSubmit: (values: SpecialtyFormValues) => Promise<void>
}

export function SpecialtyFormModal({ open, specialty, onClose, onSubmit }: SpecialtyFormModalProps) {
  const { t } = useTranslation()
  const isEdit = !!specialty

  const form = useForm<SpecialtyFormValues>({
    resolver: zodResolver(specialtySchema),
    defaultValues: { name: '', description: '' },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: specialty?.name ?? '',
        description: specialty?.description ?? '',
      })
    }
  }, [open, specialty, form])

  async function handleSubmit(values: SpecialtyFormValues) {
    try {
      await onSubmit(values)
      onClose()
    } catch {
      // Error toast already shown by the mutation hook; keep modal open.
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('repositories.specialties.editModalTitle') : t('repositories.specialties.createModalTitle')}
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="space-y-1">
            <Label htmlFor="specialty-name">{t('repositories.specialties.fields.name')}</Label>
            <Input id="specialty-name" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="specialty-description">{t('repositories.specialties.fields.description')}</Label>
            <Textarea id="specialty-description" {...form.register('description')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={form.formState.isSubmitting}>
              {t('repositories.common.cancel')}
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('repositories.common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
