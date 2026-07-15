import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { addAccountMemberSchema, type AddAccountMemberFormValues } from '../schemas/add-account-member.schema'
import { createAccountMemberSchema, type CreateAccountMemberFormValues } from '../schemas/create-account-member.schema'
import { useAddAccountMember } from '../hooks/useAddAccountMember'
import { useCreateAccountMember } from '../hooks/useCreateAccountMember'
import { useAvailableAccountMembers } from '../hooks/useAvailableAccountMembers'
import { GroupError } from '../services/groups.service'
import { UserError } from '@/features/user-management/services/users.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { getInitials, cn } from '@/lib/utils'
import type { Gender } from '@/types'

interface AddAccountMemberFormProps {
  groupId: string
  adminId: string
  onDone: () => void
}

export function AddAccountMemberForm({ groupId, adminId, onDone }: AddAccountMemberFormProps) {
  const { t } = useTranslation()
  const { addAccountMember, isPending: isAttaching } = useAddAccountMember(groupId, adminId)
  const { createAccountMember, isPending: isCreating } = useCreateAccountMember(groupId)
  const { candidates, isLoading: isLoadingCandidates } = useAvailableAccountMembers(groupId, adminId)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [alreadyInGroupError, setAlreadyInGroupError] = useState(false)
  const [alreadyInAnotherGroupError, setAlreadyInAnotherGroupError] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)

  const emailForm = useForm<AddAccountMemberFormValues>({
    resolver: zodResolver(addAccountMemberSchema),
    defaultValues: { email: '' },
  })

  const createForm = useForm<CreateAccountMemberFormValues>({
    resolver: zodResolver(createAccountMemberSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      birthDate: '',
      gender: 'unspecified',
      phone: '',
      avatarUrl: null,
    },
  })

  const selectedEmail = emailForm.watch('email')
  const selectedCandidate = candidates.find((c) => c.email === selectedEmail) ?? null

  async function handleEmailSubmit(values: AddAccountMemberFormValues) {
    setAlreadyInGroupError(false)
    setAlreadyInAnotherGroupError(false)
    try {
      await addAccountMember(values.email)
      onDone()
    } catch (error) {
      if (error instanceof GroupError && error.code === 'USER_NOT_FOUND') {
        createForm.setValue('email', values.email)
        setShowCreateForm(true)
        return
      }
      if (error instanceof GroupError && error.code === 'ALREADY_IN_GROUP') {
        setAlreadyInGroupError(true)
      }
      if (error instanceof GroupError && error.code === 'ALREADY_IN_ANOTHER_GROUP') {
        setAlreadyInAnotherGroupError(true)
      }
    }
  }

  async function handleCreateSubmit(values: CreateAccountMemberFormValues) {
    try {
      await createAccountMember({
        groupId,
        adminId,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        birthDate: values.birthDate,
        gender: values.gender,
        phone: values.phone?.trim() ? values.phone : null,
        avatarUrl: values.avatarUrl ?? null,
      })
      onDone()
    } catch (error) {
      if (error instanceof UserError && error.code === 'EMAIL_TAKEN') {
        createForm.setError('email', { message: t('users.errorEmailTaken') })
      }
    }
  }

  if (showCreateForm) {
    return (
      <form className="space-y-4" onSubmit={createForm.handleSubmit(handleCreateSubmit)}>
        <p className="text-sm text-body">{t('groups.addMember.account.createPrompt')}</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="new-member-firstName">{t('users.fields.firstName')}</Label>
            <Input id="new-member-firstName" {...createForm.register('firstName')} />
            {createForm.formState.errors.firstName && (
              <p className="text-xs text-destructive">{createForm.formState.errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="new-member-lastName">{t('users.fields.lastName')}</Label>
            <Input id="new-member-lastName" {...createForm.register('lastName')} />
            {createForm.formState.errors.lastName && (
              <p className="text-xs text-destructive">{createForm.formState.errors.lastName.message}</p>
            )}
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="new-member-email">{t('users.fields.email')}</Label>
          <Input id="new-member-email" type="email" {...createForm.register('email')} />
          {createForm.formState.errors.email && (
            <p className="text-xs text-destructive">{createForm.formState.errors.email.message}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="new-member-birthDate">{t('users.fields.birthDate')}</Label>
            <Input id="new-member-birthDate" type="date" {...createForm.register('birthDate')} />
            {createForm.formState.errors.birthDate && (
              <p className="text-xs text-destructive">{createForm.formState.errors.birthDate.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="new-member-gender">{t('users.fields.gender')}</Label>
            <Select
              value={createForm.watch('gender')}
              onValueChange={(value) => createForm.setValue('gender', value as Gender, { shouldValidate: true })}
            >
              <SelectTrigger id="new-member-gender">
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
          <Label htmlFor="new-member-phone">{t('users.fields.phone')}</Label>
          <Input id="new-member-phone" {...createForm.register('phone')} />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} disabled={isCreating}>
            {t('repositories.common.cancel')}
          </Button>
          <Button type="submit" disabled={isCreating}>
            {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('groups.addMember.account.createSubmit')}
          </Button>
        </div>
      </form>
    )
  }

  if (!isLoadingCandidates && candidates.length === 0) {
    return (
      <EmptyState
        title={t('groups.addMember.account.emptyCandidatesTitle')}
        description={t('groups.addMember.account.emptyCandidatesDescription')}
      />
    )
  }

  return (
    <form className="space-y-4" onSubmit={emailForm.handleSubmit(handleEmailSubmit)}>
      <div className="space-y-1">
        <Label htmlFor="add-member-select">{t('groups.addMember.account.selectLabel')}</Label>
        {isLoadingCandidates ? (
          <Skeleton className="h-9 w-full" />
        ) : (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                id="add-member-select"
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={popoverOpen}
                className="w-full justify-between font-normal"
              >
                {selectedCandidate
                  ? `${selectedCandidate.firstName} ${selectedCandidate.lastName}`
                  : t('groups.addMember.account.selectPlaceholder')}
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder={t('groups.addMember.account.searchPlaceholder')} />
                <CommandList>
                  <CommandEmpty>{t('groups.addMember.account.noResults')}</CommandEmpty>
                  <CommandGroup>
                    {candidates.map((candidate) => {
                      const fullName = `${candidate.firstName} ${candidate.lastName}`
                      return (
                        <CommandItem
                          key={candidate.id}
                          value={`${fullName} ${candidate.email}`}
                          onSelect={() => {
                            emailForm.setValue('email', candidate.email, { shouldValidate: true })
                            setAlreadyInGroupError(false)
                            setAlreadyInAnotherGroupError(false)
                            setPopoverOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              'h-4 w-4',
                              selectedCandidate?.id === candidate.id ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          <Avatar className="h-6 w-6">
                            {candidate.avatarUrl && <AvatarImage src={candidate.avatarUrl} alt={fullName} />}
                            <AvatarFallback className="text-xs">{getInitials(fullName)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-1 flex-col overflow-hidden">
                            <span className="truncate">{fullName}</span>
                            <span className="truncate text-xs text-muted">{candidate.email}</span>
                          </div>
                          {candidate.originAdminId ? (
                            <Badge variant="outline" className="border-transparent bg-[--color-signature-peach]">
                              {t('repositories.common.originPropagated')}
                            </Badge>
                          ) : (
                            <span className="shrink-0 text-xs text-muted">{t('repositories.common.originSuperAdmin')}</span>
                          )}
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
        {emailForm.formState.errors.email && (
          <p className="text-xs text-destructive">{emailForm.formState.errors.email.message}</p>
        )}
        {alreadyInGroupError && (
          <p className="text-xs text-destructive">{t('groups.addMember.account.alreadyInGroup')}</p>
        )}
        {alreadyInAnotherGroupError && (
          <p className="text-xs text-destructive">{t('groups.addMember.account.alreadyInAnotherGroup')}</p>
        )}
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isAttaching || !selectedCandidate}>
          {isAttaching && <Loader2 className="h-4 w-4 animate-spin" />}
          {t('groups.addMember.account.submit')}
        </Button>
      </div>
    </form>
  )
}
