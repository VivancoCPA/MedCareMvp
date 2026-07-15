import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAuth } from '@/hooks/useAuth'
import { useGroupsAdministeredBy } from '../hooks/useGroupsAdministeredBy'
import { CreateGroupModal } from '../components/CreateGroupModal'

export function AdminDashboardPage() {
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const { groups, isLoading } = useGroupsAdministeredBy(currentUser?.id ?? null)
  const [createGroupOpen, setCreateGroupOpen] = useState(false)

  if (isLoading) return null

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

  return <div>Admin / Dashboard</div>
}
