import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { groupsService } from '../services/groups.service'
import { UserError } from '@/features/user-management/services/users.service'
import { useToast } from '@/hooks/useToast'
import type { Gender } from '@/types'

interface CreateAccountMemberParams {
  groupId: string
  adminId: string
  email: string
  firstName: string
  lastName: string
  birthDate: string
  gender: Gender
  phone: string | null
  avatarUrl: string | null
}

export function useCreateAccountMember(groupId: string | null) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (params: CreateAccountMemberParams) => groupsService.createAccountMember(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] })
      toast({ title: t('groups.toastAddMemberSuccess') })
      toast({ title: t('users.toastPasswordSent') })
    },
    onError: (error) => {
      if (error instanceof UserError && error.code === 'EMAIL_TAKEN') return
      toast({ variant: 'destructive', title: t('groups.toastError') })
    },
  })

  return { createAccountMember: mutation.mutateAsync, isPending: mutation.isPending }
}
