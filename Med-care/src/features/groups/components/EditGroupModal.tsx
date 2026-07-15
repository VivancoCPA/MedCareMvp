import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Loader2, Trash2 } from 'lucide-react'
import { editGroupSchema, type EditGroupFormValues } from '../schemas/group.schema'
import { useUpdateGroup } from '../hooks/useUpdateGroup'
import { useRemoveMember } from '../hooks/useRemoveMember'
import { RemoveMemberConfirmModal } from './RemoveMemberConfirmModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import type { Group, NonAccountMember, User } from '@/types'

interface EditGroupModalProps {
  open: boolean
  group: Group | null
  members: Array<User | NonAccountMember>
  onClose: () => void
}

export function EditGroupModal({ open, group, members, onClose }: EditGroupModalProps) {
  const { t } = useTranslation()
  const { updateGroup, isPending } = useUpdateGroup(group?.id ?? null, group?.adminId ?? null)
  const { removeMember, isPending: isRemoving } = useRemoveMember(group?.id ?? null, group?.adminId ?? null)
  const [removeTarget, setRemoveTarget] = useState<User | NonAccountMember | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<EditGroupFormValues>({
    resolver: zodResolver(editGroupSchema),
    defaultValues: { name: '', avatarUrl: null },
  })

  useEffect(() => {
    if (open) {
      form.reset({ name: group?.name ?? '', avatarUrl: group?.avatarUrl ?? null })
    }
  }, [open, group, form])

  const avatarUrl = form.watch('avatarUrl')
  const name = form.watch('name')

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

  async function handleSubmit(values: EditGroupFormValues) {
    try {
      await updateGroup({ name: values.name, avatarUrl: values.avatarUrl })
      onClose()
    } catch {
      // Error toast already shown by the mutation hook; keep modal open.
    }
  }

  async function handleConfirmRemove() {
    if (!removeTarget) return
    const memberType = 'email' in removeTarget ? 'user' : 'nonAccount'
    await removeMember({ memberId: removeTarget.id, memberType })
    setRemoveTarget(null)
  }

  const isBlockedRemoval =
    !!removeTarget && !!group && 'email' in removeTarget && removeTarget.id === group.adminId

  if (!group) return null

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('groups.editModal.title')}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={t('groups.editModal.avatarAlt')} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-medium text-ink">{getInitials(name) || '—'}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="group-avatar">{t('groups.editModal.avatarLabel')}</Label>
                <input
                  ref={fileInputRef}
                  id="group-avatar"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="text-sm"
                />
                {avatarUrl && (
                  <Button type="button" variant="outline" size="sm" onClick={handleRemoveAvatar} className="w-fit">
                    {t('groups.editModal.removeAvatar')}
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="group-name">{t('groups.editModal.nameLabel')}</Label>
              <Input id="group-name" {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('groups.editModal.membersTitle')}</Label>
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-2">
                {members.map((member) => {
                  const fullName = `${member.firstName} ${member.lastName ?? ''}`.trim()
                  const isAdmin = member.id === group.adminId
                  return (
                    <div key={member.id} className="flex items-center justify-between gap-2 rounded-md px-1 py-1">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Avatar className="h-7 w-7">
                          {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={fullName} />}
                          <AvatarFallback className="text-xs">{getInitials(fullName)}</AvatarFallback>
                        </Avatar>
                        <span className="truncate text-sm text-ink">{fullName}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setRemoveTarget(member)}
                        disabled={isAdmin}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">{t('groups.memberTable.remove')}</span>
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                {t('repositories.common.cancel')}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t('repositories.common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <RemoveMemberConfirmModal
        member={removeTarget}
        isBlocked={isBlockedRemoval}
        isLoading={isRemoving}
        onConfirm={handleConfirmRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </>
  )
}
