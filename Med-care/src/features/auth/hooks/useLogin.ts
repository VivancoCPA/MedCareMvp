import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/auth.service'
import { useAuthStore } from '@/stores/auth.store'
import { getDashboardRoute } from '@/router/utils'
import type { LoginFormValues } from '../schemas/auth.schema'

export function useLogin() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: ({ email, password }: LoginFormValues) =>
      authService.login(email, password),
    onSuccess({ user, mustChangePassword }) {
      setUser(user)
      if (mustChangePassword) {
        navigate('/login/change-password', { replace: true })
      } else {
        navigate(getDashboardRoute(user.role), { replace: true })
      }
    },
  })
}
