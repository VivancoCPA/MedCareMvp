import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleGuard } from './RoleGuard'
import { useAuthStore } from '@/stores/auth.store'
import { getDashboardRoute } from './utils'
import type { UserRole } from '@/types'

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const ChangePasswordPage = lazy(() => import('@/features/auth/pages/ChangePasswordPage').then((m) => ({ default: m.ChangePasswordPage })))
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })))
const Shell = lazy(() => import('@/components/layout/Shell').then((m) => ({ default: m.Shell })))
const DoctorListPage = lazy(() =>
  import('@/features/repositories-universal/pages/DoctorListPage').then((m) => ({ default: m.DoctorListPage }))
)
const SpecialtyListPage = lazy(() =>
  import('@/features/repositories-universal/pages/SpecialtyListPage').then((m) => ({ default: m.SpecialtyListPage }))
)
const MedicalCenterListPage = lazy(() =>
  import('@/features/repositories-universal/pages/MedicalCenterListPage').then((m) => ({
    default: m.MedicalCenterListPage,
  }))
)
const InsurerListPage = lazy(() =>
  import('@/features/repositories-universal/pages/InsurerListPage').then((m) => ({ default: m.InsurerListPage }))
)
const PharmacyListPage = lazy(() =>
  import('@/features/repositories-universal/pages/PharmacyListPage').then((m) => ({ default: m.PharmacyListPage }))
)
const UserListPage = lazy(() =>
  import('@/features/user-management/pages/UserListPage').then((m) => ({ default: m.UserListPage }))
)
const GroupPage = lazy(() =>
  import('@/features/groups/pages/GroupPage').then((m) => ({ default: m.GroupPage }))
)
const AdminDashboardPage = lazy(() =>
  import('@/features/groups/pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
)
const GroupOnboardingPage = lazy(() =>
  import('@/features/groups/pages/GroupOnboardingPage').then((m) => ({ default: m.GroupOnboardingPage }))
)
const AdminSettingsPage = lazy(() =>
  import('@/features/groups/pages/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage }))
)
const MemberSettingsPage = lazy(() =>
  import('@/features/groups/pages/MemberSettingsPage').then((m) => ({ default: m.MemberSettingsPage }))
)
const GroupRepositoriesPage = lazy(() =>
  import('@/features/repositories-group/pages/GroupRepositoriesPage').then((m) => ({
    default: m.GroupRepositoriesPage,
  }))
)

function AuthPageWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>
}

function ShellLayout({ role }: { role: UserRole }) {
  return (
    <Suspense fallback={null}>
      <Shell role={role} />
    </Suspense>
  )
}

function RootRedirect() {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={getDashboardRoute(user.role)} replace />
}

function placeholder(name: string) {
  return function Page() {
    return <div>{name}</div>
  }
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/login',
    element: <AuthPageWrapper><LoginPage /></AuthPageWrapper>,
  },
  {
    path: '/login/change-password',
    element: <AuthPageWrapper><ChangePasswordPage /></AuthPageWrapper>,
  },
  {
    path: '/login/forgot-password',
    element: <AuthPageWrapper><ForgotPasswordPage /></AuthPageWrapper>,
  },
  {
    path: '/superadmin',
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleGuard allowedRoles={['superadmin']} />,
        children: [
          {
            element: <ShellLayout role="superadmin" />,
            children: [
              { path: 'users', element: <UserListPage /> },
              { path: 'doctors', element: <DoctorListPage /> },
              { path: 'specialties', element: <SpecialtyListPage /> },
              { path: 'medical-centers', element: <MedicalCenterListPage /> },
              { path: 'insurers', element: <InsurerListPage /> },
              { path: 'pharmacies', element: <PharmacyListPage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/admin',
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleGuard allowedRoles={['admin']} />,
        children: [
          {
            element: <ShellLayout role="admin" />,
            children: [
              { path: 'dashboard', element: <AdminDashboardPage /> },
              { path: 'group', element: <GroupPage /> },
              { path: 'group/onboarding/:groupId', element: <GroupOnboardingPage /> },
              {
                path: 'members/:id',
                element: <Outlet />,
                children: [
                  { index: true, element: placeholder('Admin / Member')() },
                  { path: 'health-profile', element: placeholder('Admin / Member / Health Profile')() },
                  { path: 'appointments', element: placeholder('Admin / Member / Appointments')() },
                  { path: 'exams', element: placeholder('Admin / Member / Exams')() },
                  { path: 'notes', element: placeholder('Admin / Member / Notes')() },
                ],
              },
              { path: 'repositories', element: <GroupRepositoriesPage /> },
              { path: 'settings', element: <AdminSettingsPage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/member',
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleGuard allowedRoles={['member']} />,
        children: [
          {
            element: <ShellLayout role="member" />,
            children: [
              { path: 'dashboard', element: placeholder('Member / Dashboard')() },
              { path: 'profile', element: placeholder('Member / Profile')() },
              {
                path: 'appointments',
                element: <Outlet />,
                children: [
                  { index: true, element: placeholder('Member / Appointments')() },
                  { path: 'new', element: placeholder('Member / New Appointment')() },
                  { path: ':id', element: placeholder('Member / Appointment Detail')() },
                ],
              },
              {
                path: 'exams',
                element: <Outlet />,
                children: [
                  { index: true, element: placeholder('Member / Exams')() },
                  { path: 'new', element: placeholder('Member / New Exam')() },
                  { path: ':id', element: placeholder('Member / Exam Detail')() },
                ],
              },
              { path: 'notes', element: placeholder('Member / Notes')() },
              { path: 'settings', element: <MemberSettingsPage /> },
            ],
          },
        ],
      },
    ],
  },
])
