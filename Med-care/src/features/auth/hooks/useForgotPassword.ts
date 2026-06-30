import { useMutation } from '@tanstack/react-query'
import { authService } from '../services/auth.service'

export function useForgotPassword() {
  return useMutation({
    mutationFn: ({ email }: { email: string }) =>
      authService.requestPasswordReset(email),
  })
}
