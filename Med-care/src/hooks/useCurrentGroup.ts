import { useGroupStore } from '@/stores/group.store'

export function useCurrentGroup() {
  return useGroupStore()
}
