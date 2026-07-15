import { useGroupStore } from '@/stores/group.store'

export function useAdministeredGroups() {
  return useGroupStore()
}
