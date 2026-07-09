import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { insurerSchema, type InsurerFormValues } from '../../schemas/insurer.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import type { Insurer } from '@/types'

interface InsurerFormModalProps {
  open: boolean
  insurer?: Insurer | null
  onClose: () => void
  onSubmit: (values: InsurerFormValues) => Promise<void>
}

export function InsurerFormModal({ open, insurer, onClose, onSubmit }: InsurerFormModalProps) {
  const { t } = useTranslation()
  const isEdit = !!insurer

  const form = useForm<InsurerFormValues>({
    resolver: zodResolver(insurerSchema),
    defaultValues: { name: '', emergencyPhone: '', website: '' },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: insurer?.name ?? '',
        emergencyPhone: insurer?.emergencyPhone ?? '',
        website: insurer?.website ?? '',
      })
    }
  }, [open, insurer, form])

  async function handleSubmit(values: InsurerFormValues) {
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
            {isEdit ? t('repositories.insurers.editModalTitle') : t('repositories.insurers.createModalTitle')}
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="space-y-1">
            <Label htmlFor="insurer-name">{t('repositories.insurers.fields.name')}</Label>
            <Input id="insurer-name" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="insurer-emergencyPhone">{t('repositories.insurers.fields.emergencyPhone')}</Label>
            <Input id="insurer-emergencyPhone" {...form.register('emergencyPhone')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="insurer-website">{t('repositories.insurers.fields.website')}</Label>
            <Input id="insurer-website" {...form.register('website')} />
            {form.formState.errors.website && (
              <p className="text-xs text-destructive">{form.formState.errors.website.message}</p>
            )}
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
