import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react'
import { changePasswordSchema, type ChangePasswordFormValues } from '../schemas/auth.schema'
import { useChangePassword } from '../hooks/useChangePassword'
import { AuthError } from '../services/auth.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const errorKeyMap: Record<string, string> = {
  INVALID_CURRENT_PASSWORD: 'auth.errors.invalidCurrentPassword',
  SAME_AS_CURRENT: 'auth.errors.sameAsCurrent',
}

interface PasswordRule {
  key: string
  label: string
  test: (v: string) => boolean
}

function PasswordChecklist({ value }: { value: string }) {
  const { t } = useTranslation()
  const rules: PasswordRule[] = [
    { key: 'minLength', label: t('auth.changePassword.rules.minLength'), test: (v) => v.length >= 8 },
    { key: 'uppercase', label: t('auth.changePassword.rules.uppercase'), test: (v) => /[A-Z]/.test(v) },
    { key: 'lowercase', label: t('auth.changePassword.rules.lowercase'), test: (v) => /[a-z]/.test(v) },
    { key: 'number', label: t('auth.changePassword.rules.number'), test: (v) => /[0-9]/.test(v) },
    { key: 'special', label: t('auth.changePassword.rules.special'), test: (v) => /[^A-Za-z0-9]/.test(v) },
  ]

  return (
    <ul className="mt-2 space-y-1">
      {rules.map(({ key, label, test }) => {
        const ok = test(value)
        return (
          <li key={key} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-success' : 'text-ink/50'}`}>
            {ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            {label}
          </li>
        )
      })}
    </ul>
  )
}

function PasswordField({
  id,
  label,
  registration,
  error,
  autoComplete,
}: {
  id: string
  label: string
  registration: ReturnType<ReturnType<typeof useForm>['register']>
  error?: string
  autoComplete?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          className="pr-10"
          {...registration}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center px-3 text-ink/50 hover:text-ink"
          onClick={() => setShow((v) => !v)}
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function ChangePasswordForm() {
  const { t } = useTranslation()
  const changePassword = useChangePassword()

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const newPasswordValue = form.watch('newPassword')
  const errorI18nKey =
    changePassword.error instanceof AuthError
      ? errorKeyMap[changePassword.error.code]
      : null

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(({ currentPassword, newPassword }) =>
        changePassword.mutate({ currentPassword, newPassword })
      )}
    >
      <PasswordField
        id="currentPassword"
        label={t('auth.changePassword.currentPasswordLabel')}
        registration={form.register('currentPassword')}
        error={form.formState.errors.currentPassword?.message}
        autoComplete="current-password"
      />

      <div>
        <PasswordField
          id="newPassword"
          label={t('auth.changePassword.newPasswordLabel')}
          registration={form.register('newPassword')}
          error={form.formState.errors.newPassword?.message}
          autoComplete="new-password"
        />
        <PasswordChecklist value={newPasswordValue} />
      </div>

      <PasswordField
        id="confirmPassword"
        label={t('auth.changePassword.confirmPasswordLabel')}
        registration={form.register('confirmPassword')}
        error={form.formState.errors.confirmPassword?.message}
        autoComplete="new-password"
      />

      {errorI18nKey && (
        <p className="text-sm text-destructive text-center">{t(errorI18nKey)}</p>
      )}

      <Button type="submit" className="w-full" disabled={changePassword.isPending}>
        {changePassword.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {t('auth.changePassword.submit')}
      </Button>
    </form>
  )
}
