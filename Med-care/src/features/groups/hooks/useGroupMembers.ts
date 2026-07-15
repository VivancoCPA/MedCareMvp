import { useQuery } from '@tanstack/react-query'
import { groupsService } from '../services/groups.service'

export function useGroupMembers(groupId: string | null) {
  const query = useQuery({
    queryKey: ['groupMembers', groupId],
    queryFn: async () => {
      const [group, members] = await Promise.all([
        groupsService.getGroup(groupId!),
        groupsService.getGroupMembers(groupId!),
      ])
      return { group, members }
    },
    enabled: !!groupId,
  })

  return {
    group: query.data?.group ?? null,
    members: query.data?.members ?? [],
    isLoading: query.isLoading,
  }
}
