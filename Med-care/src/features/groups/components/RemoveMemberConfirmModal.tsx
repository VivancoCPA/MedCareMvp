import { useTranslation } from 'react-i18next'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { NonAccountMember, User } from '@/types'

interface RemoveMemberConfirmModalProps {
  member: (User | NonAccountMember) | null
  isBlocked: boolean
  isLoading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function RemoveMemberConfirmModal({
  member,
  isBlocked,
  isLoading,
  onConfirm,
  onCancel,
}: RemoveMemberConfirmModalProps) {
  const { t } = useTranslation()
  const name = member ? `${member.firstName} ${member.lastName ?? ''}`.trim() : ''

  if (isBlocked) {
    return (
      <Dialog open={!!member} onOpenChange={(next) => !next && onCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('groups.removeMember.blockedTitle')}</DialogTitle>
            <DialogDescription>{t('groups.removeMember.blockedSelfAdmin')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={onCancel}>
              {t('repositories.common.cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <ConfirmModal
      open={!!member}
      title={t('groups.removeMember.confirmTitle')}
      message={t('groups.removeMember.confirmMessage', { name })}
      onConfirm={onConfirm}
      onCancel={onCancel}
      isLoading={isLoading}
    />
  )
}
