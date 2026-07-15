import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { insurerSchema, type InsurerFormValues } from '../../schemas/insurer.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { getInitials } from '@/lib/utils'
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<InsurerFormValues>({
    resolver: zodResolver(insurerSchema),
    defaultValues: { name: '', emergencyPhone: '', website: '', logoUrl: null },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: insurer?.name ?? '',
        emergencyPhone: insurer?.emergencyPhone ?? '',
        website: insurer?.website ?? '',
        logoUrl: insurer?.logoUrl ?? null,
      })
    }
  }, [open, insurer, form])

  const logoUrl = form.watch('logoUrl')
  const name = form.watch('name')

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    form.setValue('logoUrl', URL.createObjectURL(file), { shouldValidate: true })
    e.target.value = ''
  }

  function handleRemoveLogo() {
    form.setValue('logoUrl', null, { shouldValidate: true })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

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
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={t('repositories.insurers.logoAlt')}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-xs font-medium text-ink">{getInitials(name) || '—'}</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="insurer-logo">{t('repositories.insurers.fieldLogo')}</Label>
              <input
                ref={fileInputRef}
                id="insurer-logo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleLogoChange}
                className="text-sm"
              />
              {logoUrl && (
                <Button type="button" variant="outline" size="sm" onClick={handleRemoveLogo} className="w-fit">
                  {t('repositories.insurers.removeLogo')}
                </Button>
              )}
            </div>
          </div>
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
