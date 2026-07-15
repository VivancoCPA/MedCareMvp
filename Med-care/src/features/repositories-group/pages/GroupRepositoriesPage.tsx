import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { useGroupsAdministeredBy } from '@/features/groups/hooks/useGroupsAdministeredBy'
import { GroupRepositoryTab } from '../components/GroupRepositoryTab'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/shared/EmptyState'
import type { GroupRepoEntityType } from '../services/group-repositories.service'

const TAB_TYPES: GroupRepoEntityType[] = ['doctor', 'medicalCenter', 'pharmacy', 'insurer']

export function GroupRepositoriesPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { groups, isLoading } = useGroupsAdministeredBy(user?.id ?? null)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <EmptyState
        title={t('groupRepositories.common.noGroupsTitle')}
        description={t('groupRepositories.common.noGroupsDescription')}
      />
    )
  }

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) ?? groups[0]!

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-ink">{t('nav.admin.repositories')}</h1>
        {groups.length > 1 && (
          <Select value={selectedGroup.id} onValueChange={setSelectedGroupId}>
            <SelectTrigger className="sm:w-64" aria-label={t('groupRepositories.common.groupSelectorLabel')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Tabs key={selectedGroup.id} defaultValue="doctor">
        <TabsList>
          {TAB_TYPES.map((type) => (
            <TabsTrigger key={type} value={type} className="text-ink">
              {t(`groupRepositories.common.tabs.${type}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        {TAB_TYPES.map((type) => (
          <TabsContent key={type} value={type}>
            <GroupRepositoryTab groupId={selectedGroup.id} entityType={type} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
