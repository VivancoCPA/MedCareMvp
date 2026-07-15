import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { groupsService, GroupError } from '../services/groups.service'
import { useToast } from '@/hooks/useToast'

export function useAddAccountMember(groupId: string | null, adminId: string | null) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (email: string) => groupsService.addAccountMember({ groupId: groupId!, email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] })
      queryClient.invalidateQueries({ queryKey: ['availableAccountMembers', groupId, adminId] })
      toast({ title: t('groups.toastAddMemberSuccess') })
    },
    onError: (error) => {
      if (
        error instanceof GroupError &&
        (error.code === 'USER_NOT_FOUND' || error.code === 'ALREADY_IN_GROUP' || error.code === 'ALREADY_IN_ANOTHER_GROUP')
      )
        return
      toast({ variant: 'destructive', title: t('groups.toastError') })
    },
  })

  return { addAccountMember: mutation.mutateAsync, isPending: mutation.isPending }
}
