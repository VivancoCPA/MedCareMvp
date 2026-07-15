import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { groupRepositoriesService, type GroupRepoEntityType } from '../services/group-repositories.service'
import { useToast } from '@/hooks/useToast'

export function useDeactivateGroupRepositoryEntry(groupId: string, entityType: GroupRepoEntityType) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (entryId: string) =>
      groupRepositoriesService.deactivateGroupRepositoryEntry({ groupId, entityType, entryId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupRepository', groupId, entityType] })
      queryClient.invalidateQueries({ queryKey: ['importCandidates', groupId, entityType] })
      toast({ title: t('groupRepositories.common.toastDeactivateSuccess') })
    },
    onError: () => toast({ variant: 'destructive', title: t('repositories.common.toastError') }),
  })

  return { deactivateEntry: mutation.mutateAsync, isPending: mutation.isPending }
}
