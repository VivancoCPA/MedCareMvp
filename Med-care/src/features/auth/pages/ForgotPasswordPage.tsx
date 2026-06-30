import { useTranslation } from 'react-i18next'
import { AuthLayout } from '../components/AuthLayout'
import { ForgotPasswordForm } from '../components/ForgotPasswordForm'

export function ForgotPasswordPage() {
  const { t } = useTranslation()
  return (
    <AuthLayout subtitle={t('auth.forgotPassword.subtitle')}>
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
