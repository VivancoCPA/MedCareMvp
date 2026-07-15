import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { GroupRepositoryQuickAdd } from '@/features/repositories-group/components/GroupRepositoryQuickAdd'

interface OnboardingStepDoctorsProps {
  groupId: string
  onSkip: () => void
  onDone: () => void
}

export function OnboardingStepDoctors({ groupId, onSkip, onDone }: OnboardingStepDoctorsProps) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('groups.onboarding.doctors.title')}</CardTitle>
        <CardDescription>{t('groups.onboarding.doctors.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <GroupRepositoryQuickAdd groupId={groupId} entityType="doctor" />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onSkip}>
            {t('groups.onboarding.skip')}
          </Button>
          <Button onClick={onDone}>{t('groups.onboarding.continue')}</Button>
        </div>
      </CardContent>
    </Card>
  )
}
