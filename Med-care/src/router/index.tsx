import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleGuard } from './RoleGuard'
import { useAuthStore } from '@/stores/auth.store'
import { getDashboardRoute } from './utils'

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const ChangePasswordPage = lazy(() => import('@/features/auth/pages/ChangePasswordPage').then((m) => ({ default: m.ChangePasswordPage })))
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })))

function AuthPageWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>
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
          { path: 'users', element: placeholder('Superadmin / Users')() },
          { path: 'doctors', element: placeholder('Superadmin / Doctors')() },
          { path: 'specialties', element: placeholder('Superadmin / Specialties')() },
          { path: 'medical-centers', element: placeholder('Superadmin / Medical Centers')() },
          { path: 'insurers', element: placeholder('Superadmin / Insurers')() },
          { path: 'pharmacies', element: placeholder('Superadmin / Pharmacies')() },
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
          { path: 'dashboard', element: placeholder('Admin / Dashboard')() },
          { path: 'group', element: placeholder('Admin / Group')() },
          { path: 'group/onboarding', element: placeholder('Admin / Group Onboarding')() },
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
          { path: 'repositories', element: placeholder('Admin / Repositories')() },
          { path: 'settings', element: placeholder('Admin / Settings')() },
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
          { path: 'settings', element: placeholder('Member / Settings')() },
        ],
      },
    ],
  },
])
