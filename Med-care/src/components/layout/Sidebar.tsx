import {
  Building2,
  CalendarDays,
  FlaskConical,
  FolderOpen,
  HeartPulse,
  LayoutDashboard,
  NotebookPen,
  Pill,
  Settings,
  ShieldCheck,
  Stethoscope,
  Tags,
  Users,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SidebarNavItem } from './SidebarNavItem'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

interface NavItemDef {
  key: string
  to: string
  icon: LucideIcon
}

const NAV_ITEMS: Record<UserRole, NavItemDef[]> = {
  superadmin: [
    { key: 'users', to: '/superadmin/users', icon: Users },
    { key: 'doctors', to: '/superadmin/doctors', icon: Stethoscope },
    { key: 'specialties', to: '/superadmin/specialties', icon: Tags },
    { key: 'medicalCenters', to: '/superadmin/medical-centers', icon: Building2 },
    { key: 'insurers', to: '/superadmin/insurers', icon: ShieldCheck },
    { key: 'pharmacies', to: '/superadmin/pharmacies', icon: Pill },
  ],
  admin: [
    { key: 'dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { key: 'group', to: '/admin/group', icon: UsersRound },
    { key: 'repositories', to: '/admin/repositories', icon: FolderOpen },
    { key: 'settings', to: '/admin/settings', icon: Settings },
  ],
  member: [
    { key: 'dashboard', to: '/member/dashboard', icon: LayoutDashboard },
    { key: 'healthProfile', to: '/member/profile', icon: HeartPulse },
    { key: 'appointments', to: '/member/appointments', icon: CalendarDays },
    { key: 'exams', to: '/member/exams', icon: FlaskConical },
    { key: 'notes', to: '/member/notes', icon: NotebookPen },
    { key: 'settings', to: '/member/settings', icon: Settings },
  ],
}

interface SidebarProps {
  role: UserRole
  collapsed: boolean
}

export function Sidebar({ role, collapsed }: SidebarProps) {
  const { t } = useTranslation()
  const items = NAV_ITEMS[role]

  return (
    <aside
      className={cn('flex h-full shrink-0 flex-col overflow-hidden bg-surface-dark transition-all duration-200 ease-in-out')}
      style={{ width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' }}
    >
      <div className="flex h-[var(--topbar-height)] shrink-0 items-center gap-2 px-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10 text-xs font-semibold text-white">
          MFC
        </span>
        {!collapsed && <span className="truncate text-sm font-semibold text-white">MedFamilyCare</span>}
      </div>
      <TooltipProvider delayDuration={200}>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-2">
          {items.map((item) => (
            <SidebarNavItem
              key={item.key}
              icon={item.icon}
              label={t(`nav.${role}.${item.key}`)}
              to={item.to}
              collapsed={collapsed}
            />
          ))}
        </nav>
      </TooltipProvider>
    </aside>
  )
}
