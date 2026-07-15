import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

interface UserStatusBadgeProps {
  role: UserRole
}

const ROLE_STYLES: Record<UserRole, string> = {
  superadmin: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
  admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  member: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

export function UserStatusBadge({ role }: UserStatusBadgeProps) {
  const { t } = useTranslation()

  return (
    <Badge variant="outline" className={cn('border-transparent', ROLE_STYLES[role])}>
      {t(`users.roles.${role}`)}
    </Badge>
  )
}
