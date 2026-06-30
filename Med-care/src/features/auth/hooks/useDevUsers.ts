import { useQuery } from '@tanstack/react-query'
import { authService } from '../services/auth.service'

export function useDevUsers() {
  return useQuery({
    queryKey: ['devUsers'],
    queryFn: () => authService.getDevUsers(),
    enabled: import.meta.env.DEV,
    staleTime: Infinity,
  })
}
