import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { GroupRepoEntityType } from '../services/group-repositories.service'

interface DuplicateFoundDialogProps {
  open: boolean
  entityType: GroupRepoEntityType
  isLoading?: boolean
  onUseExisting: () => void
  onCreateAnyway: () => void
  onCancel: () => void
}

export function DuplicateFoundDialog({
  open,
  entityType,
  isLoading = false,
  onUseExisting,
  onCreateAnyway,
  onCancel,
}: DuplicateFoundDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('groupRepositories.common.duplicateDialog.title')}</DialogTitle>
          <DialogDescription>
            {t(`groupRepositories.common.duplicateDialog.message.${entityType}`)}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCreateAnyway} disabled={isLoading}>
            {t('groupRepositories.common.duplicateDialog.createAnyway')}
          </Button>
          <Button type="button" onClick={onUseExisting} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('groupRepositories.common.duplicateDialog.useExisting')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
