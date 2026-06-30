import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDevUsers } from '../hooks/useDevUsers'

interface DevRoleSwitcherProps {
  onSelectUser: (email: string, password: string) => void
}

export function DevRoleSwitcher({ onSelectUser }: DevRoleSwitcherProps) {
  const { t } = useTranslation()
  const { data: users = [] } = useDevUsers()

  if (!import.meta.env.DEV) return null

  function handleChange(userId: string) {
    const user = users.find((u) => u.id === userId)
    if (user) onSelectUser(user.email, user.passwordHash)
  }

  return (
    <div className="mb-4 p-3 rounded-lg bg-warning/10 border border-warning/30">
      <p className="text-xs font-medium text-warning mb-2">{t('auth.devRoleSwitcher.label')}</p>
      <Select onValueChange={handleChange}>
        <SelectTrigger className="w-full text-sm">
          <SelectValue placeholder={t('auth.devRoleSwitcher.placeholder')} />
        </SelectTrigger>
        <SelectContent>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              <span className="font-medium">{user.firstName} {user.lastName}</span>
              <span className="text-ink/50 ml-1">({user.role})</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
