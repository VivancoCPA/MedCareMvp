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
          ? 'bg-[--color-signature-mint] text-[--color-signature-forest]'
          : 'bg-[--color-surface-strong] text-[--color-muted]'
      )}
    >
      {isActive ? t('repositories.common.statusActive') : t('repositories.common.statusInactive')}
    </Badge>
  )
}
