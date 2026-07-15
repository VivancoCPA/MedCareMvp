import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { groupsService } from '../services/groups.service'
import { useToast } from '@/hooks/useToast'

interface UpdateGroupParams {
  name?: string
  avatarUrl?: string | null
}

export function useUpdateGroup(groupId: string | null, adminId: string | null) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: UpdateGroupParams) => groupsService.updateGroup(groupId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] })
      queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] })
      queryClient.invalidateQueries({ queryKey: ['groupsAdministeredBy', adminId] })
      toast({ title: t('groups.editModal.toastSuccess') })
    },
    onError: () => toast({ variant: 'destructive', title: t('groups.toastError') }),
  })

  return { updateGroup: mutation.mutateAsync, isPending: mutation.isPending }
}
