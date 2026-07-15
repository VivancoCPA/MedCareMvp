import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import { useUsers } from '../hooks/useUsers'
import { UserList } from '../components/UserList'
import { UserFormModal, type UserFormMode, type UserFormValues } from '../components/UserFormModal'
import type { User } from '@/types'

function toIsoBirthDate(date: string): string {
  return date.length === 10 ? `${date}T00:00:00Z` : date
}

export function UserListPage() {
  const { t } = useTranslation()
  const { users, isLoading, createUser, updateUser, deactivateUser, reactivateUser } = useUsers()

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<UserFormMode>('create')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [confirmDeactivateTarget, setConfirmDeactivateTarget] = useState<User | null>(null)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [confirmReactivateTarget, setConfirmReactivateTarget] = useState<User | null>(null)
  const [isReactivating, setIsReactivating] = useState(false)

  function openCreate() {
    setEditingUser(null)
    setFormMode('create')
    setFormOpen(true)
  }

  function openEdit(user: User) {
    setEditingUser(user)
    setFormMode('edit-superadmin')
    setFormOpen(true)
  }

  async function handleFormSubmit(values: UserFormValues) {
    const birthDate = toIsoBirthDate(values.birthDate)
    const phone = values.phone?.trim() ? values.phone : null
    const avatarUrl = values.avatarUrl ?? null

    if (editingUser) {
      await updateUser({
        id: editingUser.id,
        data: {
          firstName: values.firstName,
          lastName: values.lastName,
          birthDate,
          gender: values.gender,
          phone,
          avatarUrl,
          email: values.email,
          role: values.role,
        },
      })
    } else {
      await createUser({
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        birthDate,
        gender: values.gender,
        phone,
        role: values.role,
        avatarUrl,
        originAdminId: null,
      })
    }
  }

  async function handleConfirmDeactivate() {
    if (!confirmDeactivateTarget) return
    setIsDeactivating(true)
    try {
      await deactivateUser(confirmDeactivateTarget.id)
      setConfirmDeactivateTarget(null)
    } finally {
      setIsDeactivating(false)
    }
  }

  async function handleConfirmReactivate() {
    if (!confirmReactivateTarget) return
    setIsReactivating(true)
    try {
      await reactivateUser(confirmReactivateTarget.id)
      setConfirmReactivateTarget(null)
    } finally {
      setIsReactivating(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">{t('users.title')}</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t('users.createButton')}
        </Button>
      </div>

      <UserList
        users={users}
        isLoading={isLoading}
        onEdit={openEdit}
        onDeactivate={setConfirmDeactivateTarget}
        onReactivate={setConfirmReactivateTarget}
      />

      <UserFormModal
        open={formOpen}
        mode={formMode}
        user={editingUser}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <ConfirmModal
        open={!!confirmDeactivateTarget}
        title={t('users.confirmDeactivateTitle')}
        message={t('users.confirmDeactivateMessage', {
          name: confirmDeactivateTarget ? `${confirmDeactivateTarget.firstName} ${confirmDeactivateTarget.lastName}` : '',
        })}
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setConfirmDeactivateTarget(null)}
        isLoading={isDeactivating}
      />

      <ConfirmModal
        open={!!confirmReactivateTarget}
        title={t('users.confirmReactivateTitle')}
        message={t('users.confirmReactivateMessage', {
          name: confirmReactivateTarget ? `${confirmReactivateTarget.firstName} ${confirmReactivateTarget.lastName}` : '',
        })}
        onConfirm={handleConfirmReactivate}
        onCancel={() => setConfirmReactivateTarget(null)}
        isLoading={isReactivating}
      />
    </div>
  )
}
