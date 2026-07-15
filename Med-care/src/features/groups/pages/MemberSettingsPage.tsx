import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { CreateGroupModal } from '../components/CreateGroupModal'

export function MemberSettingsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [createGroupOpen, setCreateGroupOpen] = useState(false)

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold text-ink">{t('settings.title')}</h1>
      <div className="rounded-lg border p-4">
        <p className="mb-3 text-sm text-body">{t('settings.createGroupCta.description')}</p>
        <Button variant="outline" onClick={() => setCreateGroupOpen(true)}>
          {t('settings.createGroupCta.button')}
        </Button>
      </div>
      {user && (
        <CreateGroupModal
          open={createGroupOpen}
          userId={user.id}
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
