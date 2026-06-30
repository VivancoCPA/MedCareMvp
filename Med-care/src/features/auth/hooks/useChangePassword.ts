import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/auth.service'
import { useAuthStore } from '@/stores/auth.store'
import { getDashboardRoute } from '@/router/utils'

interface ChangePasswordVariables {
  currentPassword: string
  newPassword: string
}

export function useChangePassword() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: ChangePasswordVariables) => {
      if (!user) throw new Error('Not authenticated')
      return authService.changePassword(user.id, currentPassword, newPassword)
    },
    onSuccess() {
      if (!user) return
      setUser({ ...user, mustChangePassword: false })
      navigate(getDashboardRoute(user.role), { replace: true })
    },
  })
}
