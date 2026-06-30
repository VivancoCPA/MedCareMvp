import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { loginSchema, type LoginFormValues } from '../schemas/auth.schema'
import { useLogin } from '../hooks/useLogin'
import { AuthError } from '../services/auth.service'
import { DevRoleSwitcher } from './DevRoleSwitcher'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const errorKeyMap: Record<string, string> = {
  INVALID_CREDENTIALS: 'auth.errors.invalidCredentials',
  ACCOUNT_DISABLED: 'auth.errors.accountDisabled',
}

export function LoginForm() {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const login = useLogin()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const errorI18nKey =
    login.error instanceof AuthError ? errorKeyMap[login.error.code] : null

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((data) => login.mutate(data))}
    >
      <DevRoleSwitcher
        onSelectUser={(email, password) => {
          form.setValue('email', email, { shouldValidate: false })
          form.setValue('password', password, { shouldValidate: false })
        }}
      />

      <div className="space-y-1">
        <Label htmlFor="email">{t('auth.login.emailLabel')}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...form.register('email')}
        />
        {form.formState.errors.email && (
          <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">{t('auth.login.passwordLabel')}</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className="pr-10"
            {...form.register('password')}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center px-3 text-ink/50 hover:text-ink"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
        )}
      </div>

      {errorI18nKey && (
        <p className="text-sm text-destructive text-center">{t(errorI18nKey)}</p>
      )}

      <Button type="submit" className="w-full" disabled={login.isPending}>
        {login.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {t('auth.login.submit')}
      </Button>

      <p className="text-center text-sm">
        <Link to="/login/forgot-password" className="text-link hover:underline">
          {t('auth.login.forgotPassword')}
        </Link>
      </p>
    </form>
  )
}
