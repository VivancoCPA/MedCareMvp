import { useQuery } from '@tanstack/react-query'
import { groupsService } from '../services/groups.service'

export function useAvailableAccountMembers(groupId: string | null, adminId: string | null) {
  const query = useQuery({
    queryKey: ['availableAccountMembers', groupId, adminId],
    queryFn: () => groupsService.getAvailableAccountMembers(groupId!, adminId!),
    enabled: !!groupId && !!adminId,
  })

  return { candidates: query.data ?? [], isLoading: query.isLoading }
}
