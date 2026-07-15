import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import { usePharmacies } from '../hooks/usePharmacies'
import { PharmacyList } from '../components/pharmacies/PharmacyList'
import { PharmacyFormModal } from '../components/pharmacies/PharmacyFormModal'
import type { Pharmacy } from '@/types'
import type { PharmacyFormValues } from '../schemas/pharmacy.schema'

export function PharmacyListPage() {
  const { t } = useTranslation()
  const { pharmacies, isLoading, createPharmacy, updatePharmacy, deactivatePharmacy, reactivatePharmacy } =
    usePharmacies()

  const [formOpen, setFormOpen] = useState(false)
  const [editingPharmacy, setEditingPharmacy] = useState<Pharmacy | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<Pharmacy | null>(null)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [reactivateTarget, setReactivateTarget] = useState<Pharmacy | null>(null)
  const [isReactivating, setIsReactivating] = useState(false)

  function openCreate() {
    setEditingPharmacy(null)
    setFormOpen(true)
  }

  function openEdit(pharmacy: Pharmacy) {
    setEditingPharmacy(pharmacy)
    setFormOpen(true)
  }

  async function handleFormSubmit(values: PharmacyFormValues) {
    const dto = {
      name: values.name,
      address: values.address?.trim() ? values.address : null,
      phone: values.phone?.trim() ? values.phone : null,
    }
    if (editingPharmacy) {
      await updatePharmacy({ id: editingPharmacy.id, data: dto })
    } else {
      await createPharmacy(dto)
    }
  }

  async function handleConfirmDeactivate() {
    if (!confirmTarget) return
    setIsDeactivating(true)
    try {
      await deactivatePharmacy(confirmTarget.id)
      setConfirmTarget(null)
    } finally {
      setIsDeactivating(false)
    }
  }

  async function handleConfirmReactivate() {
    if (!reactivateTarget) return
    setIsReactivating(true)
    try {
      await reactivatePharmacy(reactivateTarget.id)
      setReactivateTarget(null)
    } finally {
      setIsReactivating(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">{t('repositories.pharmacies.title')}</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t('repositories.pharmacies.createButton')}
        </Button>
      </div>

      <PharmacyList
        pharmacies={pharmacies}
        isLoading={isLoading}
        onEdit={openEdit}
        onDeactivate={setConfirmTarget}
        onReactivate={setReactivateTarget}
      />

      <PharmacyFormModal
        open={formOpen}
        pharmacy={editingPharmacy}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <ConfirmModal
        open={!!confirmTarget}
        title={t('repositories.common.confirmDeactivateTitle')}
        message={t('repositories.pharmacies.confirmDeactivateMessage')}
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setConfirmTarget(null)}
        isLoading={isDeactivating}
      />

      <ConfirmModal
        open={!!reactivateTarget}
        title={t('repositories.common.confirmReactivateTitle')}
        message={t('repositories.pharmacies.confirmReactivateMessage')}
        onConfirm={handleConfirmReactivate}
        onCancel={() => setReactivateTarget(null)}
        isLoading={isReactivating}
      />
    </div>
  )
}
