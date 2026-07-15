import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import { useSpecialties } from '../hooks/useSpecialties'
import { SpecialtyList } from '../components/specialties/SpecialtyList'
import { SpecialtyFormModal } from '../components/specialties/SpecialtyFormModal'
import type { Specialty } from '@/types'
import type { SpecialtyFormValues } from '../schemas/specialty.schema'

export function SpecialtyListPage() {
  const { t } = useTranslation()
  const { specialties, isLoading, createSpecialty, updateSpecialty, deactivateSpecialty, reactivateSpecialty } =
    useSpecialties()

  const [formOpen, setFormOpen] = useState(false)
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<Specialty | null>(null)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [reactivateTarget, setReactivateTarget] = useState<Specialty | null>(null)
  const [isReactivating, setIsReactivating] = useState(false)

  function openCreate() {
    setEditingSpecialty(null)
    setFormOpen(true)
  }

  function openEdit(specialty: Specialty) {
    setEditingSpecialty(specialty)
    setFormOpen(true)
  }

  async function handleFormSubmit(values: SpecialtyFormValues) {
    const dto = { name: values.name, description: values.description?.trim() ? values.description : null }
    if (editingSpecialty) {
      await updateSpecialty({ id: editingSpecialty.id, data: dto })
    } else {
      await createSpecialty(dto)
    }
  }

  async function handleConfirmDeactivate() {
    if (!confirmTarget) return
    setIsDeactivating(true)
    try {
      await deactivateSpecialty(confirmTarget.id)
      setConfirmTarget(null)
    } finally {
      setIsDeactivating(false)
    }
  }

  async function handleConfirmReactivate() {
    if (!reactivateTarget) return
    setIsReactivating(true)
    try {
      await reactivateSpecialty(reactivateTarget.id)
      setReactivateTarget(null)
    } finally {
      setIsReactivating(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">{t('repositories.specialties.title')}</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t('repositories.specialties.createButton')}
        </Button>
      </div>

      <SpecialtyList
        specialties={specialties}
        isLoading={isLoading}
        onEdit={openEdit}
        onDeactivate={setConfirmTarget}
        onReactivate={setReactivateTarget}
      />

      <SpecialtyFormModal
        open={formOpen}
        specialty={editingSpecialty}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <ConfirmModal
        open={!!confirmTarget}
        title={t('repositories.common.confirmDeactivateTitle')}
        message={t('repositories.specialties.confirmDeactivateMessage')}
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setConfirmTarget(null)}
        isLoading={isDeactivating}
      />

      <ConfirmModal
        open={!!reactivateTarget}
        title={t('repositories.common.confirmReactivateTitle')}
        message={t('repositories.specialties.confirmReactivateMessage')}
        onConfirm={handleConfirmReactivate}
        onCancel={() => setReactivateTarget(null)}
        isLoading={isReactivating}
      />
    </div>
  )
}
