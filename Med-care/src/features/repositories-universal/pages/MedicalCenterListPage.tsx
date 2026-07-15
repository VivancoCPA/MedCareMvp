import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import { useMedicalCenters } from '../hooks/useMedicalCenters'
import { MedicalCenterList } from '../components/medical-centers/MedicalCenterList'
import { MedicalCenterFormModal } from '../components/medical-centers/MedicalCenterFormModal'
import type { MedicalCenter } from '@/types'
import type { MedicalCenterFormValues } from '../schemas/medical-center.schema'

export function MedicalCenterListPage() {
  const { t } = useTranslation()
  const {
    medicalCenters,
    isLoading,
    createMedicalCenter,
    updateMedicalCenter,
    deactivateMedicalCenter,
    reactivateMedicalCenter,
  } = useMedicalCenters()

  const [formOpen, setFormOpen] = useState(false)
  const [editingCenter, setEditingCenter] = useState<MedicalCenter | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<MedicalCenter | null>(null)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [reactivateTarget, setReactivateTarget] = useState<MedicalCenter | null>(null)
  const [isReactivating, setIsReactivating] = useState(false)

  function openCreate() {
    setEditingCenter(null)
    setFormOpen(true)
  }

  function openEdit(medicalCenter: MedicalCenter) {
    setEditingCenter(medicalCenter)
    setFormOpen(true)
  }

  async function handleFormSubmit(values: MedicalCenterFormValues) {
    const dto = {
      name: values.name,
      type: values.type as MedicalCenter['type'],
      address: values.address?.trim() ? values.address : null,
      phone: values.phone?.trim() ? values.phone : null,
    }
    if (editingCenter) {
      await updateMedicalCenter({ id: editingCenter.id, data: dto })
    } else {
      await createMedicalCenter(dto)
    }
  }

  async function handleConfirmDeactivate() {
    if (!confirmTarget) return
    setIsDeactivating(true)
    try {
      await deactivateMedicalCenter(confirmTarget.id)
      setConfirmTarget(null)
    } finally {
      setIsDeactivating(false)
    }
  }

  async function handleConfirmReactivate() {
    if (!reactivateTarget) return
    setIsReactivating(true)
    try {
      await reactivateMedicalCenter(reactivateTarget.id)
      setReactivateTarget(null)
    } finally {
      setIsReactivating(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">{t('repositories.medicalCenters.title')}</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t('repositories.medicalCenters.createButton')}
        </Button>
      </div>

      <MedicalCenterList
        medicalCenters={medicalCenters}
        isLoading={isLoading}
        onEdit={openEdit}
        onDeactivate={setConfirmTarget}
        onReactivate={setReactivateTarget}
      />

      <MedicalCenterFormModal
        open={formOpen}
        medicalCenter={editingCenter}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <ConfirmModal
        open={!!confirmTarget}
        title={t('repositories.common.confirmDeactivateTitle')}
        message={t('repositories.medicalCenters.confirmDeactivateMessage')}
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setConfirmTarget(null)}
        isLoading={isDeactivating}
      />

      <ConfirmModal
        open={!!reactivateTarget}
        title={t('repositories.common.confirmReactivateTitle')}
        message={t('repositories.medicalCenters.confirmReactivateMessage')}
        onConfirm={handleConfirmReactivate}
        onCancel={() => setReactivateTarget(null)}
        isLoading={isReactivating}
      />
    </div>
  )
}
