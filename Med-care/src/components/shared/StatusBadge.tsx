import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  isActive: boolean
}

export function StatusBadge({ isActive }: StatusBadgeProps) {
  const { t } = useTranslation()

  return (
    <Badge
      variant="outline"
      className={cn(
        'border-transparent',
        isActive
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
      )}
    >
      {isActive ? t('repositories.common.statusActive') : t('repositories.common.statusInactive')}
    </Badge>
  )
}
