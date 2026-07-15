import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AddMemberTabs } from './AddMemberTabs'

interface OnboardingStepMembersProps {
  groupId: string
  adminId: string
  onSkip: () => void
  onDone: () => void
}

export function OnboardingStepMembers({ groupId, adminId, onSkip, onDone }: OnboardingStepMembersProps) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('groups.onboarding.members.title')}</CardTitle>
        <CardDescription>{t('groups.onboarding.members.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <AddMemberTabs groupId={groupId} adminId={adminId} onDone={onDone} />
        <div className="flex justify-end">
          <Button variant="outline" onClick={onSkip}>
            {t('groups.onboarding.skip')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
