import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Loader2, MailCheck } from 'lucide-react'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../schemas/auth.schema'
import { useForgotPassword } from '../hooks/useForgotPassword'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ForgotPasswordForm() {
  const { t } = useTranslation()
  const mutation = useForgotPassword()

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  if (mutation.isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <MailCheck className="w-12 h-12 text-success" />
        </div>
        <p className="text-sm text-ink">{t('auth.forgotPassword.sentState')}</p>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => mutation.reset()}
        >
          {t('auth.forgotPassword.resend')}
        </Button>
        <p className="text-sm">
          <Link to="/login" className="text-link hover:underline">
            {t('auth.forgotPassword.backToLogin')}
          </Link>
        </p>
      </div>
    )
  }

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
    >
      <div className="space-y-1">
        <Label htmlFor="email">{t('auth.forgotPassword.emailLabel')}</Label>
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

      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {t('auth.forgotPassword.submit')}
      </Button>

      <p className="text-center text-sm">
        <Link to="/login" className="text-link hover:underline">
          {t('auth.forgotPassword.backToLogin')}
        </Link>
      </p>
    </form>
  )
}
