import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { doctorSchema, type DoctorFormValues } from '../../schemas/doctor.schema'
import { useSpecialties } from '../../hooks/useSpecialties'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import type { Doctor } from '@/types'

interface DoctorFormModalProps {
  open: boolean
  doctor?: Doctor | null
  onClose: () => void
  onSubmit: (values: DoctorFormValues) => Promise<void>
}

export function DoctorFormModal({ open, doctor, onClose, onSubmit }: DoctorFormModalProps) {
  const { t } = useTranslation()
  const { specialties } = useSpecialties()
  const isEdit = !!doctor
  const activeSpecialties = specialties.filter((s) => s.isActive)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: { firstName: '', lastName: '', specialtyId: '', phone: '', email: '', avatarUrl: null },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        firstName: doctor?.firstName ?? '',
        lastName: doctor?.lastName ?? '',
        specialtyId: doctor?.specialtyId ?? '',
        phone: doctor?.phone ?? '',
        email: doctor?.email ?? '',
        avatarUrl: doctor?.avatarUrl ?? null,
      })
    }
  }, [open, doctor, form])

  const avatarUrl = form.watch('avatarUrl')
  const firstName = form.watch('firstName')
  const lastName = form.watch('lastName')

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    form.setValue('avatarUrl', URL.createObjectURL(file), { shouldValidate: true })
    e.target.value = ''
  }

  function handleRemovePhoto() {
    form.setValue('avatarUrl', null, { shouldValidate: true })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(values: DoctorFormValues) {
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
            {isEdit ? t('repositories.doctors.editModalTitle') : t('repositories.doctors.createModalTitle')}
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={t('repositories.doctors.avatarAlt')} />}
              <AvatarFallback>{getInitials(`${firstName} ${lastName}`) || '—'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <Label htmlFor="doctor-avatar">{t('repositories.doctors.fieldAvatar')}</Label>
              <input
                ref={fileInputRef}
                id="doctor-avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                className="text-sm"
              />
              {avatarUrl && (
                <Button type="button" variant="outline" size="sm" onClick={handleRemovePhoto} className="w-fit">
                  {t('repositories.doctors.removeAvatar')}
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="doctor-firstName">{t('repositories.doctors.fields.firstName')}</Label>
            <Input id="doctor-firstName" {...form.register('firstName')} />
            {form.formState.errors.firstName && (
              <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="doctor-lastName">{t('repositories.doctors.fields.lastName')}</Label>
            <Input id="doctor-lastName" {...form.register('lastName')} />
            {form.formState.errors.lastName && (
              <p className="text-xs text-destructive">{form.formState.errors.lastName.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="doctor-specialty">{t('repositories.doctors.fields.specialty')}</Label>
            <Select
              value={form.watch('specialtyId')}
              onValueChange={(value) => form.setValue('specialtyId', value, { shouldValidate: true })}
            >
              <SelectTrigger id="doctor-specialty">
                <SelectValue placeholder={t('repositories.doctors.fields.specialtyPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {activeSpecialties.map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.specialtyId && (
              <p className="text-xs text-destructive">{form.formState.errors.specialtyId.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="doctor-phone">{t('repositories.doctors.fields.phone')}</Label>
            <Input id="doctor-phone" {...form.register('phone')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="doctor-email">{t('repositories.doctors.fields.email')}</Label>
            <Input id="doctor-email" type="email" {...form.register('email')} />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
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
