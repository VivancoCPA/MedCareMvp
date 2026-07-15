import { useQuery } from '@tanstack/react-query'
import { groupRepositoriesService, type GroupRepoEntityType } from '../services/group-repositories.service'

export function useImportCandidates(groupId: string, entityType: GroupRepoEntityType) {
  const query = useQuery({
    queryKey: ['importCandidates', groupId, entityType],
    queryFn: () => groupRepositoriesService.getImportCandidates(groupId, entityType),
    enabled: !!groupId,
  })

  return { candidates: query.data ?? [], isLoading: query.isLoading }
}
