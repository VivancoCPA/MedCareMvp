import { useQuery } from '@tanstack/react-query'
import { groupsService } from '../services/groups.service'
import { useGroupStore } from '@/stores/group.store'

export function useGroupsAdministeredBy(adminId: string | null) {
  const query = useQuery({
    queryKey: ['groupsAdministeredBy', adminId],
    queryFn: async () => {
      const groups = await groupsService.getGroupsAdministeredBy(adminId!)
      useGroupStore.getState().setAdministeredGroups(groups)
      return groups
    },
    enabled: !!adminId,
  })

  return { groups: query.data ?? [], isLoading: query.isLoading }
}
