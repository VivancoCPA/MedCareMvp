import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import {
  medicalCenterSchema,
  medicalCenterTypeValues,
  type MedicalCenterFormValues,
} from '../../schemas/medical-center.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import type { MedicalCenter } from '@/types'

interface MedicalCenterFormModalProps {
  open: boolean
  medicalCenter?: MedicalCenter | null
  onClose: () => void
  onSubmit: (values: MedicalCenterFormValues) => Promise<void>
}

export function MedicalCenterFormModal({ open, medicalCenter, onClose, onSubmit }: MedicalCenterFormModalProps) {
  const { t } = useTranslation()
  const isEdit = !!medicalCenter

  const form = useForm<MedicalCenterFormValues>({
    resolver: zodResolver(medicalCenterSchema),
    defaultValues: { name: '', type: '', address: '', phone: '' },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: medicalCenter?.name ?? '',
        type: medicalCenter?.type ?? '',
        address: medicalCenter?.address ?? '',
        phone: medicalCenter?.phone ?? '',
      })
    }
  }, [open, medicalCenter, form])

  async function handleSubmit(values: MedicalCenterFormValues) {
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
            {isEdit
              ? t('repositories.medicalCenters.editModalTitle')
              : t('repositories.medicalCenters.createModalTitle')}
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="space-y-1">
            <Label htmlFor="medical-center-name">{t('repositories.medicalCenters.fields.name')}</Label>
            <Input id="medical-center-name" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="medical-center-type">{t('repositories.medicalCenters.fields.type')}</Label>
            <Select
              value={form.watch('type')}
              onValueChange={(value) => form.setValue('type', value, { shouldValidate: true })}
            >
              <SelectTrigger id="medical-center-type">
                <SelectValue placeholder={t('repositories.medicalCenters.fields.typePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {medicalCenterTypeValues.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`repositories.medicalCenters.types.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.type && (
              <p className="text-xs text-destructive">{form.formState.errors.type.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="medical-center-address">{t('repositories.medicalCenters.fields.address')}</Label>
            <Input id="medical-center-address" {...form.register('address')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="medical-center-phone">{t('repositories.medicalCenters.fields.phone')}</Label>
            <Input id="medical-center-phone" {...form.register('phone')} />
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
