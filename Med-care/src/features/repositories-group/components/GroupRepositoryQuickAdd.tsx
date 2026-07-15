import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { useGroupRepository } from '../hooks/useGroupRepository'
import { ImportEntityModal } from './ImportEntityModal'
import { CreateOwnEntryModal } from './CreateOwnEntryModal'
import type { GroupRepoEntityType, GroupRepositoryEntry } from '../services/group-repositories.service'
import { Button } from '@/components/ui/button'
import type { Doctor, MedicalCenter, Pharmacy, Insurer } from '@/types'

interface GroupRepositoryQuickAddProps {
  groupId: string
  entityType: GroupRepoEntityType
}

function getEntryName(entry: GroupRepositoryEntry, entityType: GroupRepoEntityType): string {
  if (entityType === 'doctor') {
    const doctor = entry.entity as Doctor
    return `${doctor.firstName} ${doctor.lastName}`
  }
  return (entry.entity as MedicalCenter | Pharmacy | Insurer).name
}

export function GroupRepositoryQuickAdd({ groupId, entityType }: GroupRepositoryQuickAddProps) {
  const { t } = useTranslation()
  const { entries, isLoading } = useGroupRepository(groupId, entityType)
  const [importOpen, setImportOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => setImportOpen(true)}>
          {t('groupRepositories.common.importButton')}
        </Button>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          {t('groupRepositories.common.createButton')}
        </Button>
      </div>

      {!isLoading && entries.length > 0 && (
        <ul className="space-y-1">
          {entries.map((entry) => (
            <li key={entry.entryId} className="text-sm text-body">
              {getEntryName(entry, entityType)}
            </li>
          ))}
        </ul>
      )}

      <ImportEntityModal open={importOpen} groupId={groupId} entityType={entityType} onClose={() => setImportOpen(false)} />
      <CreateOwnEntryModal open={createOpen} groupId={groupId} entityType={entityType} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
