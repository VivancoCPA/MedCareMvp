import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { GroupOnboardingStepper } from '../components/GroupOnboardingStepper'

export function GroupOnboardingPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()

  if (!user || !groupId) return null

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ink">{t('groups.onboarding.title')}</h1>
      <GroupOnboardingStepper groupId={groupId} adminId={user.id} onFinish={() => navigate('/admin/group')} />
    </div>
  )
}
