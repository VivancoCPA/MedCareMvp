import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth.store'
import { AuthLayout } from '../components/AuthLayout'
import { ChangePasswordForm } from '../components/ChangePasswordForm'

export function ChangePasswordPage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)

  if (!user) return <Navigate to="/login" replace />

  return (
    <AuthLayout subtitle={t('auth.changePassword.subtitle')}>
      <ChangePasswordForm />
    </AuthLayout>
  )
}
