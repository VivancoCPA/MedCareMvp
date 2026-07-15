import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { nonAccountMemberSchema, type NonAccountMemberFormValues } from '../schemas/non-account-member.schema'
import { useUpdateNonAccountMember } from '../hooks/useUpdateNonAccountMember'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import type { BloodType, Gender, NonAccountMember, NonAccountMemberType } from '@/types'

interface EditNonAccountMemberModalProps {
  member: NonAccountMember | null
  groupId: string
  onClose: () => void
}

const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']

export function EditNonAccountMemberModal({ member, groupId, onClose }: EditNonAccountMemberModalProps) {
  const { t } = useTranslation()
  const { updateNonAccountMember, isPending } = useUpdateNonAccountMember(groupId)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<NonAccountMemberFormValues>({
    resolver: zodResolver(nonAccountMemberSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      memberType: 'human',
      birthDate: '',
      gender: 'unspecified',
      breed: '',
      bloodType: null,
      avatarUrl: null,
    },
  })

  useEffect(() => {
    if (member) {
      form.reset({
        firstName: member.firstName,
        lastName: member.lastName ?? '',
        memberType: member.memberType,
        birthDate: member.birthDate ?? '',
        gender: member.gender,
        breed: member.breed ?? '',
        bloodType: member.bloodType,
        avatarUrl: member.avatarUrl,
      })
    }
  }, [member, form])

  const memberType = form.watch('memberType')
  const isHuman = memberType === 'human'
  const avatarUrl = form.watch('avatarUrl')
  const firstName = form.watch('firstName')
  const lastName = form.watch('lastName')

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    form.setValue('avatarUrl', URL.createObjectURL(file), { shouldValidate: true })
    e.target.value = ''
  }

  function handleRemoveAvatar() {
    form.setValue('avatarUrl', null, { shouldValidate: true })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleMemberTypeChange(value: string) {
    const nextType = value as NonAccountMemberType
    form.setValue('memberType', nextType, { shouldValidate: true })
    if (nextType !== 'human') {
      form.setValue('gender', 'unspecified', { shouldValidate: true })
    }
  }

  async function handleSubmit(values: NonAccountMemberFormValues) {
    if (!member) return
    try {
      await updateNonAccountMember({
        memberId: member.id,
        firstName: values.firstName,
        lastName: values.lastName?.trim() ? values.lastName : null,
        memberType: values.memberType,
        birthDate: values.birthDate?.trim() ? values.birthDate : null,
        gender: values.gender,
        breed: values.memberType === 'pet' && values.breed?.trim() ? values.breed : null,
        bloodType: values.bloodType ?? null,
        avatarUrl: values.avatarUrl ?? null,
      })
      onClose()
    } catch {
      // Error toast already shown by the mutation hook; keep modal open.
    }
  }

  return (
    <Dialog open={!!member} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('groups.editNonAccountMember.title')}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={t('groups.addMember.nonAccount.avatarAlt')} />}
              <AvatarFallback>{getInitials(`${firstName} ${lastName}`) || '—'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-nonaccount-avatar">{t('groups.addMember.nonAccount.avatarLabel')}</Label>
              <input
                ref={fileInputRef}
                id="edit-nonaccount-avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="text-sm"
              />
              {avatarUrl && (
                <Button type="button" variant="outline" size="sm" onClick={handleRemoveAvatar} className="w-fit">
                  {t('groups.addMember.nonAccount.removeAvatar')}
                </Button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="edit-nonaccount-firstName">{t('groups.addMember.nonAccount.fields.firstName')}</Label>
              <Input id="edit-nonaccount-firstName" {...form.register('firstName')} />
              {form.formState.errors.firstName && (
                <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-nonaccount-lastName">{t('groups.addMember.nonAccount.fields.lastName')}</Label>
              <Input id="edit-nonaccount-lastName" {...form.register('lastName')} />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-nonaccount-memberType">{t('groups.addMember.nonAccount.fields.memberType')}</Label>
            <Select value={memberType} onValueChange={handleMemberTypeChange}>
              <SelectTrigger id="edit-nonaccount-memberType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="human">{t('groups.addMember.nonAccount.memberTypes.human')}</SelectItem>
                <SelectItem value="pet">{t('groups.addMember.nonAccount.memberTypes.pet')}</SelectItem>
                <SelectItem value="other">{t('groups.addMember.nonAccount.memberTypes.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="edit-nonaccount-birthDate">{t('groups.addMember.nonAccount.fields.birthDate')}</Label>
              <Input id="edit-nonaccount-birthDate" type="date" {...form.register('birthDate')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-nonaccount-gender">{t('groups.addMember.nonAccount.fields.gender')}</Label>
              <Select
                value={form.watch('gender')}
                onValueChange={(value) => form.setValue('gender', value as Gender, { shouldValidate: true })}
              >
                <SelectTrigger id="edit-nonaccount-gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {isHuman ? (
                    <>
                      <SelectItem value="male">{t('users.genders.male')}</SelectItem>
                      <SelectItem value="female">{t('users.genders.female')}</SelectItem>
                      <SelectItem value="other">{t('users.genders.other')}</SelectItem>
                      <SelectItem value="unspecified">{t('users.genders.unspecified')}</SelectItem>
                    </>
                  ) : (
                    <SelectItem value="unspecified">{t('users.genders.unspecified')}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {memberType === 'pet' && (
            <div className="space-y-1">
              <Label htmlFor="edit-nonaccount-breed">{t('groups.addMember.nonAccount.fields.breed')}</Label>
              <Input id="edit-nonaccount-breed" {...form.register('breed')} />
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="edit-nonaccount-bloodType">{t('groups.addMember.nonAccount.fields.bloodType')}</Label>
            <Select
              value={form.watch('bloodType') ?? 'none'}
              onValueChange={(value) =>
                form.setValue('bloodType', value === 'none' ? null : (value as BloodType), { shouldValidate: true })
              }
            >
              <SelectTrigger id="edit-nonaccount-bloodType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('groups.addMember.nonAccount.bloodTypeNone')}</SelectItem>
                {BLOOD_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === 'unknown' ? t('groups.addMember.nonAccount.bloodTypeUnknown') : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              {t('repositories.common.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('groups.editNonAccountMember.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
