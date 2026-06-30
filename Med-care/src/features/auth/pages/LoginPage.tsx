import { useTranslation } from 'react-i18next'
import { AuthLayout } from '../components/AuthLayout'
import { LoginForm } from '../components/LoginForm'

export function LoginPage() {
  const { t } = useTranslation()
  return (
    <AuthLayout subtitle={t('auth.login.subtitle')}>
      <LoginForm />
    </AuthLayout>
  )
}
