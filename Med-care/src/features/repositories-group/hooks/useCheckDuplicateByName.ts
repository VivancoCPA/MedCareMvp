import { useMutation } from '@tanstack/react-query'
import { groupRepositoriesService, type GroupRepoEntityType } from '../services/group-repositories.service'

export function useCheckDuplicateByName(entityType: GroupRepoEntityType) {
  const mutation = useMutation({
    mutationFn: (name: string) => groupRepositoriesService.checkDuplicateByName(entityType, name),
  })

  return { checkDuplicate: mutation.mutateAsync, isPending: mutation.isPending }
}
