import { NavLink } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface SidebarNavItemProps {
  icon: LucideIcon
  label: string
  to: string
  collapsed: boolean
}

export function SidebarNavItem({ icon: Icon, label, to, collapsed }: SidebarNavItemProps) {
  const link = (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md border-l-[3px] border-transparent px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-hover',
          collapsed && 'justify-center px-0',
          isActive && 'border-sidebar-border bg-sidebar-active text-sidebar-foreground'
        )
      }
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  )

  if (!collapsed) return link

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}
