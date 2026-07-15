import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAuth } from '@/hooks/useAuth'
import { useGroupsAdministeredBy } from '../hooks/useGroupsAdministeredBy'
import { GroupSection } from '../components/GroupSection'
import { CreateGroupModal } from '../components/CreateGroupModal'

export function GroupPage() {
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const { groups, isLoading } = useGroupsAdministeredBy(currentUser?.id ?? null)
  const [createGroupOpen, setCreateGroupOpen] = useState(false)

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
      <>
        <EmptyState
          title={t('groups.empty.title')}
          description={t('groups.empty.description')}
          action={{ label: t('groups.empty.cta'), onClick: () => setCreateGroupOpen(true) }}
        />
        {currentUser && (
          <CreateGroupModal
            open={createGroupOpen}
            userId={currentUser.id}
            onClose={() => setCreateGroupOpen(false)}
            onCreated={(group) => {
              setCreateGroupOpen(false)
              navigate(`/admin/group/onboarding/${group.id}`)
            }}
          />
        )}
      </>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">{t('groups.myGroups.title')}</h1>
        <Button variant="outline" onClick={() => setCreateGroupOpen(true)}>
          <Plus className="h-4 w-4" />
          {t('groups.myGroups.createAnother')}
        </Button>
      </div>

      {groups.map((group) => (
        <GroupSection key={group.id} group={group} />
      ))}

      {currentUser && (
        <CreateGroupModal
          open={createGroupOpen}
          userId={currentUser.id}
          onClose={() => setCreateGroupOpen(false)}
          onCreated={(group) => {
            setCreateGroupOpen(false)
            navigate(`/admin/group/onboarding/${group.id}`)
          }}
        />
      )}
    </div>
  )
}
