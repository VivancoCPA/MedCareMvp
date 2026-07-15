import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { createGroupSchema, type CreateGroupFormValues } from '../schemas/group.schema'
import { useCreateGroup } from '../hooks/useCreateGroup'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getInitials } from '@/lib/utils'
import type { Group } from '@/types'

interface CreateGroupModalProps {
  open: boolean
  userId: string
  onClose: () => void
  onCreated: (group: Group) => void
}

export function CreateGroupModal({ open, userId, onClose, onCreated }: CreateGroupModalProps) {
  const { t } = useTranslation()
  const { createGroup, isPending } = useCreateGroup()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: { name: '', avatarUrl: null },
  })

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

  async function handleSubmit(values: CreateGroupFormValues) {
    try {
      const { group } = await createGroup({ name: values.name, userId, avatarUrl: values.avatarUrl })
      form.reset()
      onCreated(group)
    } catch {
      // Error toast already shown by the mutation hook; keep modal open.
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          form.reset()
          onClose()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('groups.createModal.title')}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
              {avatarUrl ? (
                <img src={avatarUrl} alt={t('groups.createModal.avatarAlt')} className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-medium text-ink">{getInitials(name) || '—'}</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-group-avatar">{t('groups.createModal.avatarLabel')}</Label>
              <input
                ref={fileInputRef}
                id="new-group-avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="text-sm"
              />
              {avatarUrl && (
                <Button type="button" variant="outline" size="sm" onClick={handleRemoveAvatar} className="w-fit">
                  {t('groups.createModal.removeAvatar')}
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="new-group-name">{t('groups.createModal.nameLabel')}</Label>
            <Input id="new-group-name" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              {t('repositories.common.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('groups.createModal.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
