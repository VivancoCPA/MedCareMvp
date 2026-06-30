import type { UserRole } from '@/types'

export function getDashboardRoute(role: UserRole): string {
  const routes: Record<UserRole, string> = {
    superadmin: '/superadmin/users',
    admin: '/admin/dashboard',
    member: '/member/dashboard',
  }
  return routes[role]
}
