import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { groupsService } from '../services/groups.service'
import { useToast } from '@/hooks/useToast'

export function useToggleGroupStatus(groupId: string | null, adminId: string | null) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['group', groupId] })
    queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] })
    queryClient.invalidateQueries({ queryKey: ['groupsAdministeredBy', adminId] })
  }

  const deactivateMutation = useMutation({
    mutationFn: () => groupsService.deactivateGroup(groupId!),
    onSuccess: () => {
      invalidate()
      toast({ title: t('groups.status.toastDeactivateSuccess') })
    },
    onError: () => toast({ variant: 'destructive', title: t('groups.toastError') }),
  })

  const reactivateMutation = useMutation({
    mutationFn: () => groupsService.reactivateGroup(groupId!),
    onSuccess: () => {
      invalidate()
      toast({ title: t('groups.status.toastReactivateSuccess') })
    },
    onError: () => toast({ variant: 'destructive', title: t('groups.toastError') }),
  })

  return {
    deactivateGroup: deactivateMutation.mutateAsync,
    reactivateGroup: reactivateMutation.mutateAsync,
    isPending: deactivateMutation.isPending || reactivateMutation.isPending,
  }
}
