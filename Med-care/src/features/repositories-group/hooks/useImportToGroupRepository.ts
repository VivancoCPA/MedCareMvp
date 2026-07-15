import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { groupRepositoriesService, type GroupRepoEntityType } from '../services/group-repositories.service'
import { useToast } from '@/hooks/useToast'

export function useImportToGroupRepository(groupId: string, entityType: GroupRepoEntityType) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (entityId: string) =>
      groupRepositoriesService.importToGroupRepository({ groupId, entityType, entityId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupRepository', groupId, entityType] })
      queryClient.invalidateQueries({ queryKey: ['importCandidates', groupId, entityType] })
      toast({ title: t('groupRepositories.common.toastImportSuccess') })
    },
    onError: () => toast({ variant: 'destructive', title: t('repositories.common.toastError') }),
  })

  return { importEntity: mutation.mutateAsync, isPending: mutation.isPending }
}
