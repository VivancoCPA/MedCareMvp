import { useState } from 'react'
import { useCheckDuplicateByName } from '../hooks/useCheckDuplicateByName'
import { useCreateGroupOwnEntry } from '../hooks/useCreateGroupOwnEntry'
import { useImportToGroupRepository } from '../hooks/useImportToGroupRepository'
import { DuplicateFoundDialog } from './DuplicateFoundDialog'
import type { GroupRepoEntityType } from '../services/group-repositories.service'
import { DoctorFormModal } from '@/features/repositories-universal/components/doctors/DoctorFormModal'
import { MedicalCenterFormModal } from '@/features/repositories-universal/components/medical-centers/MedicalCenterFormModal'
import { PharmacyFormModal } from '@/features/repositories-universal/components/pharmacies/PharmacyFormModal'
import { InsurerFormModal } from '@/features/repositories-universal/components/insurers/InsurerFormModal'
import type { DoctorFormValues } from '@/features/repositories-universal/schemas/doctor.schema'
import type { MedicalCenterFormValues } from '@/features/repositories-universal/schemas/medical-center.schema'
import type { PharmacyFormValues } from '@/features/repositories-universal/schemas/pharmacy.schema'
import type { InsurerFormValues } from '@/features/repositories-universal/schemas/insurer.schema'
import type { Doctor, MedicalCenter, Pharmacy, Insurer } from '@/types'

type FormValues = DoctorFormValues | MedicalCenterFormValues | PharmacyFormValues | InsurerFormValues
type DuplicateMatch = Doctor | MedicalCenter | Pharmacy | Insurer

interface CreateOwnEntryModalProps {
  open: boolean
  groupId: string
  entityType: GroupRepoEntityType
  onClose: () => void
}

function getQueryName(entityType: GroupRepoEntityType, values: FormValues): string {
  if (entityType === 'doctor') {
    const v = values as DoctorFormValues
    return `${v.firstName} ${v.lastName}`
  }
  return (values as MedicalCenterFormValues | PharmacyFormValues | InsurerFormValues).name
}

function toDto(entityType: GroupRepoEntityType, values: FormValues) {
  switch (entityType) {
    case 'doctor': {
      const v = values as DoctorFormValues
      return {
        firstName: v.firstName,
        lastName: v.lastName,
        specialtyId: v.specialtyId,
        phone: v.phone?.trim() ? v.phone : null,
        email: v.email?.trim() ? v.email : null,
        avatarUrl: v.avatarUrl ?? null,
      }
    }
    case 'medicalCenter': {
      const v = values as MedicalCenterFormValues
      return {
        name: v.name,
        type: v.type as MedicalCenter['type'],
        address: v.address?.trim() ? v.address : null,
        phone: v.phone?.trim() ? v.phone : null,
      }
    }
    case 'pharmacy': {
      const v = values as PharmacyFormValues
      return {
        name: v.name,
        address: v.address?.trim() ? v.address : null,
        phone: v.phone?.trim() ? v.phone : null,
      }
    }
    case 'insurer': {
      const v = values as InsurerFormValues
      return {
        name: v.name,
        emergencyPhone: v.emergencyPhone?.trim() ? v.emergencyPhone : null,
        website: v.website?.trim() ? v.website : null,
        logoUrl: v.logoUrl ?? null,
      }
    }
  }
}

export function CreateOwnEntryModal({ open, groupId, entityType, onClose }: CreateOwnEntryModalProps) {
  const { checkDuplicate } = useCheckDuplicateByName(entityType)
  const { importEntity, isPending: isImporting } = useImportToGroupRepository(groupId, entityType)
  const { createOwnEntry, isPending: isCreating } = useCreateGroupOwnEntry(groupId, entityType)

  const [pendingValues, setPendingValues] = useState<FormValues | null>(null)
  const [duplicateMatch, setDuplicateMatch] = useState<DuplicateMatch | null>(null)

  function resetDuplicateState() {
    setPendingValues(null)
    setDuplicateMatch(null)
  }

  async function handleFormSubmit(values: FormValues) {
    const match = await checkDuplicate(getQueryName(entityType, values))
    if (match) {
      setPendingValues(values)
      setDuplicateMatch(match)
      // Swallowed by the underlying FormModal's catch block, which keeps it open
      // while DuplicateFoundDialog is shown on top.
      throw new Error('DUPLICATE_FOUND')
    }
    await createOwnEntry(toDto(entityType, values))
  }

  async function handleUseExisting() {
    if (!duplicateMatch) return
    await importEntity(duplicateMatch.id)
    resetDuplicateState()
    onClose()
  }

  async function handleCreateAnyway() {
    if (!pendingValues) return
    await createOwnEntry(toDto(entityType, pendingValues))
    resetDuplicateState()
    onClose()
  }

  return (
    <>
      {entityType === 'doctor' && (
        <DoctorFormModal open={open} onClose={onClose} onSubmit={handleFormSubmit} />
      )}
      {entityType === 'medicalCenter' && (
        <MedicalCenterFormModal open={open} onClose={onClose} onSubmit={handleFormSubmit} />
      )}
      {entityType === 'pharmacy' && (
        <PharmacyFormModal open={open} onClose={onClose} onSubmit={handleFormSubmit} />
      )}
      {entityType === 'insurer' && (
        <InsurerFormModal open={open} onClose={onClose} onSubmit={handleFormSubmit} />
      )}

      <DuplicateFoundDialog
        open={!!duplicateMatch}
        entityType={entityType}
        isLoading={isImporting || isCreating}
        onUseExisting={handleUseExisting}
        onCreateAnyway={handleCreateAnyway}
        onCancel={resetDuplicateState}
      />
    </>
  )
}
