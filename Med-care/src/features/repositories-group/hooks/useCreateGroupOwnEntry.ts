import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  groupRepositoriesService,
  type GroupOwnEntryData,
  type GroupRepoEntityType,
} from '../services/group-repositories.service'
import { useToast } from '@/hooks/useToast'

type GroupOwnEntryDataFor<T extends GroupRepoEntityType> = Extract<GroupOwnEntryData, { entityType: T }>['data']

function universalQueryKeyFor(entityType: GroupRepoEntityType): string[] {
  switch (entityType) {
    case 'doctor':
      return ['doctors']
    case 'medicalCenter':
      return ['medical-centers']
    case 'pharmacy':
      return ['pharmacies']
    case 'insurer':
      return ['insurers']
  }
}

export function useCreateGroupOwnEntry<T extends GroupRepoEntityType>(groupId: string, entityType: T) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: GroupOwnEntryDataFor<T>) =>
      // Safe: T and `data` are always paired by the caller via the generic constraint above.
      groupRepositoriesService.createGroupOwnEntry({ groupId, entityType, data } as GroupOwnEntryData & {
        groupId: string
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupRepository', groupId, entityType] })
      queryClient.invalidateQueries({ queryKey: ['importCandidates', groupId, entityType] })
      queryClient.invalidateQueries({ queryKey: universalQueryKeyFor(entityType) })
      toast({ title: t('groupRepositories.common.toastCreateSuccess') })
    },
    onError: () => toast({ variant: 'destructive', title: t('repositories.common.toastError') }),
  })

  return { createOwnEntry: mutation.mutateAsync, isPending: mutation.isPending }
}
