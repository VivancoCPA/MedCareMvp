import { useQuery } from '@tanstack/react-query'
import { groupRepositoriesService, type GroupRepoEntityType } from '../services/group-repositories.service'

export function useGroupRepository(groupId: string, entityType: GroupRepoEntityType) {
  const query = useQuery({
    queryKey: ['groupRepository', groupId, entityType],
    queryFn: () => groupRepositoriesService.getGroupRepository(groupId, entityType),
    enabled: !!groupId,
  })

  return { entries: query.data ?? [], isLoading: query.isLoading }
}
