import { useTranslation } from 'react-i18next'

export function AdminSettingsPage() {
  const { t } = useTranslation()

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold text-ink">{t('settings.title')}</h1>
    </div>
  )
}
