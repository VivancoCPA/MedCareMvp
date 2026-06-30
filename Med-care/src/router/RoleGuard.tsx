import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { getDashboardRoute } from './utils'
import type { UserRole } from '@/types'

interface RoleGuardProps {
  allowedRoles: UserRole[]
}

export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user)

  if (!user) return <Navigate to="/login" replace />

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardRoute(user.role)} replace />
  }

  return <Outlet />
}
