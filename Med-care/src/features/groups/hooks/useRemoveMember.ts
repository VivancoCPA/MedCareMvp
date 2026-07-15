import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { groupsService, GroupError } from '../services/groups.service'
import { useToast } from '@/hooks/useToast'
import type { MemberType } from '@/types'

export function useRemoveMember(groupId: string | null, adminId: string | null) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (params: { memberId: string; memberType: MemberType }) =>
      groupsService.removeMember({ groupId: groupId!, ...params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] })
      queryClient.invalidateQueries({ queryKey: ['availableAccountMembers', groupId, adminId] })
      toast({ title: t('groups.toastRemoveMemberSuccess') })
    },
    onError: (error) => {
      if (error instanceof GroupError && error.code === 'CANNOT_REMOVE_SELF_AS_ADMIN') {
        toast({ variant: 'destructive', title: t('groups.removeMember.blockedSelfAdmin') })
        return
      }
      toast({ variant: 'destructive', title: t('groups.toastError') })
    },
  })

  return { removeMember: mutation.mutateAsync, isPending: mutation.isPending }
}
