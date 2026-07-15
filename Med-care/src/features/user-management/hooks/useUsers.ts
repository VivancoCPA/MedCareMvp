import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { usersService, UserError, type CreateUserDTO, type UpdateUserDTO } from '../services/users.service'
import { useToast } from '@/hooks/useToast'

const USERS_QUERY_KEY = ['users']

export function useUsers() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: () => usersService.getAll(),
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
  }

  function toastGenericError(error: unknown) {
    if (error instanceof UserError && error.code === 'EMAIL_TAKEN') return
    toast({ variant: 'destructive', title: t('users.toastError') })
  }

  const createMutation = useMutation({
    mutationFn: (data: CreateUserDTO) => usersService.create(data),
    onSuccess: () => {
      invalidate()
      toast({ title: t('users.toastCreateSuccess') })
      toast({ title: t('users.toastPasswordSent') })
    },
    onError: toastGenericError,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDTO }) => usersService.update(id, data),
    onSuccess: () => {
      invalidate()
      toast({ title: t('users.toastUpdateSuccess') })
    },
    onError: toastGenericError,
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => usersService.deactivate(id),
    onSuccess: () => {
      invalidate()
      toast({ title: t('users.toastDeactivateSuccess') })
      toast({ title: t('users.toastPdfSent') })
    },
    onError: toastGenericError,
  })

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => usersService.reactivate(id),
    onSuccess: () => {
      invalidate()
      toast({ title: t('users.toastReactivateSuccess') })
    },
    onError: toastGenericError,
  })

  return {
    users: query.data ?? [],
    isLoading: query.isLoading,
    createUser: createMutation.mutateAsync,
    updateUser: updateMutation.mutateAsync,
    deactivateUser: deactivateMutation.mutateAsync,
    reactivateUser: reactivateMutation.mutateAsync,
  }
}
