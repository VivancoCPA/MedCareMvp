import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import { OnboardingStepDoctors } from './OnboardingStepDoctors'
import { OnboardingStepCentersPharmacies } from './OnboardingStepCentersPharmacies'
import { OnboardingStepMembers } from './OnboardingStepMembers'
import { cn } from '@/lib/utils'

interface GroupOnboardingStepperProps {
  groupId: string
  adminId: string
  onFinish: () => void
}

type StepStatus = 'pending' | 'completed' | 'skipped'

const STEP_COUNT = 3

export function GroupOnboardingStepper({ groupId, adminId, onFinish }: GroupOnboardingStepperProps) {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)
  const [stepStatus, setStepStatus] = useState<StepStatus[]>(['pending', 'pending', 'pending'])

  function advance(status: StepStatus) {
    setStepStatus((prev) => {
      const next = [...prev]
      next[currentStep] = status
      return next
    })
    if (currentStep === STEP_COUNT - 1) {
      onFinish()
      return
    }
    setCurrentStep((prev) => prev + 1)
  }

  const stepLabels = [
    t('groups.onboarding.steps.doctors'),
    t('groups.onboarding.steps.centersPharmacies'),
    t('groups.onboarding.steps.members'),
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-4">
        {stepLabels.map((label, index) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium',
                index === currentStep
                  ? 'border-primary bg-primary text-primary-foreground'
                  : stepStatus[index] !== 'pending'
                    ? 'border-emerald-500 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'border-muted text-muted'
              )}
            >
              {stepStatus[index] !== 'pending' ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <span className="text-sm text-body">{label}</span>
          </div>
        ))}
      </div>

      {currentStep === 0 && (
        <OnboardingStepDoctors
          groupId={groupId}
          onSkip={() => advance('skipped')}
          onDone={() => advance('completed')}
        />
      )}
      {currentStep === 1 && (
        <OnboardingStepCentersPharmacies
          groupId={groupId}
          onSkip={() => advance('skipped')}
          onDone={() => advance('completed')}
        />
      )}
      {currentStep === 2 && (
        <OnboardingStepMembers
          groupId={groupId}
          adminId={adminId}
          onSkip={() => advance('skipped')}
          onDone={() => advance('completed')}
        />
      )}
    </div>
  )
}
