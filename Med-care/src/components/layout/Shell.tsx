import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { PageWrapper } from './PageWrapper'
import { useSidebar } from '@/hooks/useSidebar'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

interface ShellProps {
  role: UserRole
}

export function Shell({ role }: ShellProps) {
  const { sidebarOpen, collapsed, tier, closeSidebar } = useSidebar()

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      {tier === 'mobile' ? (
        <>
          {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50" onClick={closeSidebar} />}
          <div
            className={cn(
              'fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            <Sidebar role={role} collapsed={false} />
          </div>
        </>
      ) : (
        <Sidebar role={role} collapsed={collapsed} />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar role={role} />
        <main className="flex-1 overflow-y-auto">
          <PageWrapper>
            <Outlet />
          </PageWrapper>
        </main>
      </div>
    </div>
  )
}
