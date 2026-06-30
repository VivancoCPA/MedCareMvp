import { create } from 'zustand'
import type { Group, NonAccountMember, User } from '@/types'

interface GroupState {
  currentGroup: Group | null
  members: Array<User | NonAccountMember>
  setGroup: (group: Group, members: Array<User | NonAccountMember>) => void
  clearGroup: () => void
}

export const useGroupStore = create<GroupState>()((set) => ({
  currentGroup: null,
  members: [],
  setGroup(group, members) {
    set({ currentGroup: group, members })
  },
  clearGroup() {
    set({ currentGroup: null, members: [] })
  },
}))
