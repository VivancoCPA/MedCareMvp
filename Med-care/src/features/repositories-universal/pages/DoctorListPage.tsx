import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import { useDoctors } from '../hooks/useDoctors'
import { useSpecialties } from '../hooks/useSpecialties'
import { DoctorList } from '../components/doctors/DoctorList'
import { DoctorFormModal } from '../components/doctors/DoctorFormModal'
import type { Doctor } from '@/types'
import type { DoctorFormValues } from '../schemas/doctor.schema'

export function DoctorListPage() {
  const { t } = useTranslation()
  const { doctors, isLoading, createDoctor, updateDoctor, deactivateDoctor, reactivateDoctor } = useDoctors()
  const { specialties } = useSpecialties()

  const [formOpen, setFormOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<Doctor | null>(null)
  const [isDeactivating, setIsDeactivating] = useState(false)

  function openCreate() {
    setEditingDoctor(null)
    setFormOpen(true)
  }

  function openEdit(doctor: Doctor) {
    setEditingDoctor(doctor)
    setFormOpen(true)
  }

  async function handleFormSubmit(values: DoctorFormValues) {
    const dto = {
      firstName: values.firstName,
      lastName: values.lastName,
      specialtyId: values.specialtyId,
      phone: values.phone?.trim() ? values.phone : null,
      email: values.email?.trim() ? values.email : null,
    }
    if (editingDoctor) {
      await updateDoctor({ id: editingDoctor.id, data: dto })
    } else {
      await createDoctor(dto)
    }
  }

  async function handleConfirmDeactivate() {
    if (!confirmTarget) return
    setIsDeactivating(true)
    try {
      await deactivateDoctor(confirmTarget.id)
      setConfirmTarget(null)
    } finally {
      setIsDeactivating(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">{t('repositories.doctors.title')}</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t('repositories.doctors.createButton')}
        </Button>
      </div>

      <DoctorList
        doctors={doctors}
        specialties={specialties}
        isLoading={isLoading}
        onEdit={openEdit}
        onDeactivate={setConfirmTarget}
        onReactivate={(doctor) => reactivateDoctor(doctor.id)}
      />

      <DoctorFormModal
        open={formOpen}
        doctor={editingDoctor}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <ConfirmModal
        open={!!confirmTarget}
        title={t('repositories.common.confirmDeactivateTitle')}
        message={t('repositories.doctors.confirmDeactivateMessage')}
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setConfirmTarget(null)}
        isLoading={isDeactivating}
      />
    </div>
  )
}
