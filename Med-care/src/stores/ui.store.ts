import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiState {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      sidebarOpen: false,
      sidebarCollapsed: false,
      setSidebarOpen(open) {
        set({ sidebarOpen: open })
      },
      setSidebarCollapsed(collapsed) {
        set({ sidebarCollapsed: collapsed })
      },
      toggleSidebar() {
        set({ sidebarCollapsed: !get().sidebarCollapsed })
      },
    }),
    {
      name: 'med-care-ui',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
)
