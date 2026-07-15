import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { GroupRepositoryQuickAdd } from '@/features/repositories-group/components/GroupRepositoryQuickAdd'

interface OnboardingStepCentersPharmaciesProps {
  groupId: string
  onSkip: () => void
  onDone: () => void
}

export function OnboardingStepCentersPharmacies({ groupId, onSkip, onDone }: OnboardingStepCentersPharmaciesProps) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('groups.onboarding.centersPharmacies.title')}</CardTitle>
        <CardDescription>{t('groups.onboarding.centersPharmacies.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-ink">{t('groupRepositories.common.tabs.medicalCenter')}</h3>
          <GroupRepositoryQuickAdd groupId={groupId} entityType="medicalCenter" />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-ink">{t('groupRepositories.common.tabs.pharmacy')}</h3>
          <GroupRepositoryQuickAdd groupId={groupId} entityType="pharmacy" />
        </div>
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
