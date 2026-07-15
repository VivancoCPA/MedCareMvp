import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import { useInsurers } from '../hooks/useInsurers'
import { InsurerList } from '../components/insurers/InsurerList'
import { InsurerFormModal } from '../components/insurers/InsurerFormModal'
import type { Insurer } from '@/types'
import type { InsurerFormValues } from '../schemas/insurer.schema'

export function InsurerListPage() {
  const { t } = useTranslation()
  const { insurers, isLoading, createInsurer, updateInsurer, deactivateInsurer, reactivateInsurer } = useInsurers()

  const [formOpen, setFormOpen] = useState(false)
  const [editingInsurer, setEditingInsurer] = useState<Insurer | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<Insurer | null>(null)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [reactivateTarget, setReactivateTarget] = useState<Insurer | null>(null)
  const [isReactivating, setIsReactivating] = useState(false)

  function openCreate() {
    setEditingInsurer(null)
    setFormOpen(true)
  }

  function openEdit(insurer: Insurer) {
    setEditingInsurer(insurer)
    setFormOpen(true)
  }

  async function handleFormSubmit(values: InsurerFormValues) {
    const dto = {
      name: values.name,
      emergencyPhone: values.emergencyPhone?.trim() ? values.emergencyPhone : null,
      website: values.website?.trim() ? values.website : null,
      logoUrl: values.logoUrl ?? null,
    }
    if (editingInsurer) {
      await updateInsurer({ id: editingInsurer.id, data: dto })
    } else {
      await createInsurer(dto)
    }
  }

  async function handleConfirmDeactivate() {
    if (!confirmTarget) return
    setIsDeactivating(true)
    try {
      await deactivateInsurer(confirmTarget.id)
      setConfirmTarget(null)
    } finally {
      setIsDeactivating(false)
    }
  }

  async function handleConfirmReactivate() {
    if (!reactivateTarget) return
    setIsReactivating(true)
    try {
      await reactivateInsurer(reactivateTarget.id)
      setReactivateTarget(null)
    } finally {
      setIsReactivating(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">{t('repositories.insurers.title')}</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t('repositories.insurers.createButton')}
        </Button>
      </div>

      <InsurerList
        insurers={insurers}
        isLoading={isLoading}
        onEdit={openEdit}
        onDeactivate={setConfirmTarget}
        onReactivate={setReactivateTarget}
      />

      <InsurerFormModal
        open={formOpen}
        insurer={editingInsurer}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <ConfirmModal
        open={!!confirmTarget}
        title={t('repositories.common.confirmDeactivateTitle')}
        message={t('repositories.insurers.confirmDeactivateMessage')}
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setConfirmTarget(null)}
        isLoading={isDeactivating}
      />

      <ConfirmModal
        open={!!reactivateTarget}
        title={t('repositories.common.confirmReactivateTitle')}
        message={t('repositories.insurers.confirmReactivateMessage')}
        onConfirm={handleConfirmReactivate}
        onCancel={() => setReactivateTarget(null)}
        isLoading={isReactivating}
      />
    </div>
  )
}
