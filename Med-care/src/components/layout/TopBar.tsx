import { Menu, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'
import { useAdministeredGroups } from '@/hooks/useAdministeredGroups'
import { useSidebar } from '@/hooks/useSidebar'
import { useThemeStore } from '@/stores/theme.store'
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
  const { administeredGroups } = useAdministeredGroups()
  const { tier, toggleSidebar } = useSidebar()
  const { theme, toggleTheme } = useThemeStore()

  const contextText =
    role === 'superadmin'
      ? t('layout.superadminPanel')
      : role === 'admin'
        ? administeredGroups.length > 0
          ? administeredGroups.map((g) => g.name).join(', ')
          : t('layout.noGroup')
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
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-body hover:bg-surface-soft hover:text-ink"
          aria-label={theme === 'dark' ? t('layout.switchToLight') : t('layout.switchToDark')}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
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
      </div>
    </header>
  )
}
