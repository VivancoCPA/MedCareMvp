import { useEffect, useRef } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import {
  createUserSchema,
  updateUserSuperAdminSchema,
  updateUserAdminSchema,
  type CreateUserFormValues,
  type UpdateUserSAFormValues,
  type UpdateUserAdminFormValues,
} from '../schemas/user.schema'
import { UserError } from '../services/users.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import type { User, Gender, UserRole } from '@/types'

export type UserFormMode = 'create' | 'edit-superadmin' | 'edit-admin'

export type UserFormValues = CreateUserFormValues | UpdateUserSAFormValues | UpdateUserAdminFormValues

// Superset shape used for the form's internal state; each mode's Zod schema
// validates/strips the fields that aren't relevant to it (email/role for edit-admin).
type FormShape = CreateUserFormValues

interface UserFormModalProps {
  open: boolean
  mode: UserFormMode
  user?: User | null
  onClose: () => void
  onSubmit: (values: UserFormValues) => Promise<void>
}

const SCHEMAS = {
  create: createUserSchema,
  'edit-superadmin': updateUserSuperAdminSchema,
  'edit-admin': updateUserAdminSchema,
}

export function UserFormModal({ open, mode, user, onClose, onSubmit }: UserFormModalProps) {
  const { t } = useTranslation()
  const isCreate = mode === 'create'
  const emailRoleEditable = mode === 'create' || mode === 'edit-superadmin'
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<FormShape>({
    resolver: zodResolver(SCHEMAS[mode]) as Resolver<FormShape>,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'member',
      birthDate: '',
      gender: 'unspecified',
      phone: '',
      avatarUrl: null,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
        email: user?.email ?? '',
        role: user?.role ?? 'member',
        birthDate: user?.birthDate ? user.birthDate.slice(0, 10) : '',
        gender: user?.gender ?? 'unspecified',
        phone: user?.phone ?? '',
        avatarUrl: user?.avatarUrl ?? null,
      })
    }
  }, [open, user, form])

  const role = form.watch('role')
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

  async function handleSubmit(values: FormShape) {
    try {
      await onSubmit(values)
      onClose()
    } catch (error) {
      if (error instanceof UserError && error.code === 'EMAIL_TAKEN') {
        form.setError('email', { message: t('users.errorEmailTaken') })
        return
      }
      // Generic failure toast already shown by the mutation hook; keep modal open.
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isCreate ? t('users.createModalTitle') : t('users.editModalTitle')}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={t('users.avatarAlt')} />}
              <AvatarFallback>{getInitials(`${firstName} ${lastName}`) || '—'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-avatar">{t('users.fieldAvatar')}</Label>
              <input
                ref={fileInputRef}
                id="user-avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                className="text-sm"
              />
              {avatarUrl && (
                <Button type="button" variant="outline" size="sm" onClick={handleRemovePhoto} className="w-fit">
                  {t('users.removeAvatar')}
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="user-firstName">{t('users.fields.firstName')}</Label>
              <Input id="user-firstName" {...form.register('firstName')} />
              {form.formState.errors.firstName && (
                <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="user-lastName">{t('users.fields.lastName')}</Label>
              <Input id="user-lastName" {...form.register('lastName')} />
              {form.formState.errors.lastName && (
                <p className="text-xs text-destructive">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="user-email">{t('users.fields.email')}</Label>
            {emailRoleEditable ? (
              <>
                <Input id="user-email" type="email" {...form.register('email')} />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
              </>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-block w-full">
                      <Input id="user-email" type="email" value={user?.email ?? ''} disabled className="pointer-events-none" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{t('users.tooltips.emailRoleDisabled')}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="user-role">{t('users.fields.role')}</Label>
            {emailRoleEditable ? (
              <>
                <Select
                  value={role}
                  onValueChange={(value) => form.setValue('role', value as UserRole, { shouldValidate: true })}
                >
                  <SelectTrigger id="user-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="superadmin">{t('users.roles.superadmin')}</SelectItem>
                    <SelectItem value="admin">{t('users.roles.admin')}</SelectItem>
                    <SelectItem value="member">{t('users.roles.member')}</SelectItem>
                  </SelectContent>
                </Select>
                {isCreate && role === 'admin' && (
                  <Alert variant="info" className="mt-2">
                    <AlertTitle>{t('users.adminNoGroupWarningTitle')}</AlertTitle>
                    <AlertDescription>{t('users.adminNoGroupWarningDescription')}</AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-block w-full">
                      <Input
                        id="user-role"
                        value={user ? t(`users.roles.${user.role}`) : ''}
                        disabled
                        className="pointer-events-none"
                      />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{t('users.tooltips.emailRoleDisabled')}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="user-birthDate">{t('users.fields.birthDate')}</Label>
              <Input id="user-birthDate" type="date" {...form.register('birthDate')} />
              {form.formState.errors.birthDate && (
                <p className="text-xs text-destructive">{form.formState.errors.birthDate.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="user-gender">{t('users.fields.gender')}</Label>
              <Select
                value={form.watch('gender')}
                onValueChange={(value) => form.setValue('gender', value as Gender, { shouldValidate: true })}
              >
                <SelectTrigger id="user-gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t('users.genders.male')}</SelectItem>
                  <SelectItem value="female">{t('users.genders.female')}</SelectItem>
                  <SelectItem value="other">{t('users.genders.other')}</SelectItem>
                  <SelectItem value="unspecified">{t('users.genders.unspecified')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="user-phone">{t('users.fields.phone')}</Label>
            <Input id="user-phone" {...form.register('phone')} />
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
