import { useTranslation } from 'react-i18next'
import { Pencil, Plus, Power, PowerOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { getInitials } from '@/lib/utils'
import type { Group } from '@/types'

interface GroupHeaderProps {
  group: Group
  onEdit: () => void
  onToggleStatus: () => void
  onAddMember: () => void
}

export function GroupHeader({ group, onEdit, onToggleStatus, onAddMember }: GroupHeaderProps) {
  const { t } = useTranslation()

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
          {group.avatarUrl ? (
            <img src={group.avatarUrl} alt={group.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-medium text-ink">{getInitials(group.name)}</span>
          )}
        </div>
        <h1 className="text-2xl font-semibold text-ink">{group.name}</h1>
        <StatusBadge isActive={group.isActive} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
          {t('groups.header.editName')}
        </Button>
        <Button variant="outline" onClick={onToggleStatus}>
          {group.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
          {group.isActive ? t('groups.status.deactivateButton') : t('groups.status.reactivateButton')}
        </Button>
        <Button onClick={onAddMember}>
          <Plus className="h-4 w-4" />
          {t('groups.addMember.button')}
        </Button>
      </div>
    </div>
  )
}
