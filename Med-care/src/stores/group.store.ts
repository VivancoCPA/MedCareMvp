import { create } from 'zustand'
import type { Group } from '@/types'

interface GroupState {
  administeredGroups: Group[]
  setAdministeredGroups: (groups: Group[]) => void
  clearAdministeredGroups: () => void
}

export const useGroupStore = create<GroupState>()((set) => ({
  administeredGroups: [],
  setAdministeredGroups(groups) {
    set({ administeredGroups: groups })
  },
  clearAdministeredGroups() {
    set({ administeredGroups: [] })
  },
}))
