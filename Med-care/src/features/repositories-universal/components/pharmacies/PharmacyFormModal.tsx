import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { pharmacySchema, type PharmacyFormValues } from '../../schemas/pharmacy.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import type { Pharmacy } from '@/types'

interface PharmacyFormModalProps {
  open: boolean
  pharmacy?: Pharmacy | null
  onClose: () => void
  onSubmit: (values: PharmacyFormValues) => Promise<void>
}

export function PharmacyFormModal({ open, pharmacy, onClose, onSubmit }: PharmacyFormModalProps) {
  const { t } = useTranslation()
  const isEdit = !!pharmacy

  const form = useForm<PharmacyFormValues>({
    resolver: zodResolver(pharmacySchema),
    defaultValues: { name: '', address: '', phone: '' },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: pharmacy?.name ?? '',
        address: pharmacy?.address ?? '',
        phone: pharmacy?.phone ?? '',
      })
    }
  }, [open, pharmacy, form])

  async function handleSubmit(values: PharmacyFormValues) {
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
            {isEdit ? t('repositories.pharmacies.editModalTitle') : t('repositories.pharmacies.createModalTitle')}
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="space-y-1">
            <Label htmlFor="pharmacy-name">{t('repositories.pharmacies.fields.name')}</Label>
            <Input id="pharmacy-name" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="pharmacy-address">{t('repositories.pharmacies.fields.address')}</Label>
            <Input id="pharmacy-address" {...form.register('address')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pharmacy-phone">{t('repositories.pharmacies.fields.phone')}</Label>
            <Input id="pharmacy-phone" {...form.register('phone')} />
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
