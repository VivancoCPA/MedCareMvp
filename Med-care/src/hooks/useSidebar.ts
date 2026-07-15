import { useEffect, useSyncExternalStore } from 'react'
import { useLocation } from 'react-router-dom'
import { useUiStore } from '@/stores/ui.store'

export type SidebarTier = 'mobile' | 'tablet' | 'desktop'

const TABLET_QUERY = '(min-width: 768px) and (max-width: 1023.98px)'
const DESKTOP_QUERY = '(min-width: 1024px)'

function getTier(): SidebarTier {
  if (window.matchMedia(DESKTOP_QUERY).matches) return 'desktop'
  if (window.matchMedia(TABLET_QUERY).matches) return 'tablet'
  return 'mobile'
}

function subscribe(callback: () => void) {
  const tabletMql = window.matchMedia(TABLET_QUERY)
  const desktopMql = window.matchMedia(DESKTOP_QUERY)
  tabletMql.addEventListener('change', callback)
  desktopMql.addEventListener('change', callback)
  return () => {
    tabletMql.removeEventListener('change', callback)
    desktopMql.removeEventListener('change', callback)
  }
}

export function useSidebar() {
  const tier = useSyncExternalStore(subscribe, getTier)
  const sidebarOpen = useUiStore((s) => s.sidebarOpen)
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen)
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebarCollapsed = useUiStore((s) => s.toggleSidebar)
  const location = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname, setSidebarOpen])

  const collapsed = tier === 'tablet' || (tier === 'desktop' && sidebarCollapsed)

  return {
    sidebarOpen,
    collapsed,
    tier,
    toggleSidebar: () => setSidebarOpen(!sidebarOpen),
    closeSidebar: () => setSidebarOpen(false),
    toggleSidebarCollapsed,
  }
}
