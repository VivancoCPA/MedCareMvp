import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import { useGroupMembers } from '../hooks/useGroupMembers'
import { useRemoveMember } from '../hooks/useRemoveMember'
import { useToggleGroupStatus } from '../hooks/useToggleGroupStatus'
import { GroupHeader } from './GroupHeader'
import { MemberTable } from './MemberTable'
import { AddMemberTabs } from './AddMemberTabs'
import { RemoveMemberConfirmModal } from './RemoveMemberConfirmModal'
import { EditGroupModal } from './EditGroupModal'
import { EditNonAccountMemberModal } from './EditNonAccountMemberModal'
import type { Group, MemberType, NonAccountMember, User } from '@/types'

interface GroupSectionProps {
  group: Group
}

export function GroupSection({ group }: GroupSectionProps) {
  const { t } = useTranslation()
  const { members, isLoading } = useGroupMembers(group.id)
  const { removeMember, isPending: isRemoving } = useRemoveMember(group.id, group.adminId)
  const {
    deactivateGroup,
    reactivateGroup,
    isPending: isTogglingStatus,
  } = useToggleGroupStatus(group.id, group.adminId)

  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [editingNonAccountMember, setEditingNonAccountMember] = useState<NonAccountMember | null>(null)
  const [removeTarget, setRemoveTarget] = useState<User | NonAccountMember | null>(null)
  const [editGroupOpen, setEditGroupOpen] = useState(false)
  const [toggleStatusConfirmOpen, setToggleStatusConfirmOpen] = useState(false)

  async function handleConfirmRemove() {
    if (!removeTarget) return
    const memberType: MemberType = 'email' in removeTarget ? 'user' : 'nonAccount'
    await removeMember({ memberId: removeTarget.id, memberType })
    setRemoveTarget(null)
  }

  async function handleConfirmToggleStatus() {
    if (group.isActive) {
      await deactivateGroup()
    } else {
      await reactivateGroup()
    }
    setToggleStatusConfirmOpen(false)
  }

  const isBlockedRemoval = !!removeTarget && 'email' in removeTarget && removeTarget.id === group.adminId

  return (
    <div className="mb-10">
      <GroupHeader
        group={group}
        onEdit={() => setEditGroupOpen(true)}
        onToggleStatus={() => setToggleStatusConfirmOpen(true)}
        onAddMember={() => setAddMemberOpen(true)}
      />

      <MemberTable
        group={group}
        members={members}
        isLoading={isLoading}
        onEditNonAccountMember={setEditingNonAccountMember}
        onRemove={setRemoveTarget}
      />

      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('groups.addMember.modalTitle')}</DialogTitle>
          </DialogHeader>
          <AddMemberTabs groupId={group.id} adminId={group.adminId} onDone={() => setAddMemberOpen(false)} />
        </DialogContent>
      </Dialog>

      <EditNonAccountMemberModal
        member={editingNonAccountMember}
        groupId={group.id}
        onClose={() => setEditingNonAccountMember(null)}
      />

      <RemoveMemberConfirmModal
        member={removeTarget}
        isBlocked={isBlockedRemoval}
        isLoading={isRemoving}
        onConfirm={handleConfirmRemove}
        onCancel={() => setRemoveTarget(null)}
      />

      <EditGroupModal open={editGroupOpen} group={group} members={members} onClose={() => setEditGroupOpen(false)} />

      <ConfirmModal
        open={toggleStatusConfirmOpen}
        title={group.isActive ? t('groups.status.confirmDeactivateTitle') : t('groups.status.confirmReactivateTitle')}
        message={
          group.isActive
            ? t('groups.status.confirmDeactivateMessage', { name: group.name })
            : t('groups.status.confirmReactivateMessage', { name: group.name })
        }
        onConfirm={handleConfirmToggleStatus}
        onCancel={() => setToggleStatusConfirmOpen(false)}
        isLoading={isTogglingStatus}
      />
    </div>
  )
}
