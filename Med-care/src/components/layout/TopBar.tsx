import { Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'
import { useCurrentGroup } from '@/hooks/useCurrentGroup'
import { useSidebar } from '@/hooks/useSidebar'
import type { UserRole } from '@/types'

interface TopBarProps {
  role: UserRole
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function TopBar({ role }: TopBarProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { currentGroup } = useCurrentGroup()
  const { tier, toggleSidebar } = useSidebar()

  const contextText =
    role === 'superadmin'
      ? t('layout.superadminPanel')
      : role === 'admin'
        ? (currentGroup?.name ?? t('layout.noGroup'))
        : user
          ? `${user.firstName} ${user.lastName}`
          : ''

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex h-[var(--topbar-height)] shrink-0 items-center justify-between border-b border-hairline bg-canvas px-4">
      <div className="flex min-w-0 items-center gap-3">
        {tier !== 'desktop' && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-ink hover:bg-surface-soft"
            aria-label={t('layout.toggleSidebar')}
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <span className="truncate text-sm font-medium text-ink">{contextText}</span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-strong text-sm font-semibold text-ink"
          >
            {user ? getInitials(user.firstName, user.lastName) : ''}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate(`/${role}/settings`)}>
            {t('layout.userMenu.myAccount')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>{t('layout.userMenu.logout')}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
