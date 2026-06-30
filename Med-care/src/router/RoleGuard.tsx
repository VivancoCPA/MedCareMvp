import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import type { UserRole } from '@/types'

const roleDashboard: Record<UserRole, string> = {
  superadmin: '/superadmin/users',
  admin: '/admin/dashboard',
  member: '/member/dashboard',
}

interface RoleGuardProps {
  allowedRoles: UserRole[]
}

export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={roleDashboard[user.role]} replace />
  }
  return <Outlet />
}
