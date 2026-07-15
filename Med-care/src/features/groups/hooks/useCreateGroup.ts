import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { groupsService } from '../services/groups.service'
import { useToast } from '@/hooks/useToast'
import { useAuthStore } from '@/stores/auth.store'

export function useCreateGroup() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (params: { name: string; userId: string; avatarUrl?: string | null }) =>
      groupsService.createGroup(params),
    onSuccess: ({ user }, variables) => {
      useAuthStore.getState().setUser(user)
      queryClient.invalidateQueries({ queryKey: ['groupsAdministeredBy', variables.userId] })
      queryClient.invalidateQueries({ queryKey: ['auth', 'currentUser'] })
      toast({ title: t('groups.toastCreateSuccess') })
    },
    onError: () => {
      toast({ variant: 'destructive', title: t('groups.toastError') })
    },
  })

  return { createGroup: mutation.mutateAsync, isPending: mutation.isPending }
}
