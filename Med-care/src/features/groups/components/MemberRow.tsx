import { useTranslation } from 'react-i18next'
import { Pencil, Trash2 } from 'lucide-react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { getInitials } from '@/lib/utils'
import type { NonAccountMember, User } from '@/types'

function isUser(member: User | NonAccountMember): member is User {
  return 'email' in member
}

interface MemberRowProps {
  member: User | NonAccountMember
  isAdmin: boolean
  onEditNonAccountMember: (member: NonAccountMember) => void
  onRemove: (member: User | NonAccountMember) => void
}

export function MemberRow({ member, isAdmin, onEditNonAccountMember, onRemove }: MemberRowProps) {
  const { t } = useTranslation()
  const memberIsUser = isUser(member)
  const fullName = `${member.firstName} ${member.lastName ?? ''}`.trim()
  const typeLabel = memberIsUser
    ? t('groups.memberTable.type.account')
    : t(`groups.memberTable.type.${member.memberType}`)

  return (
    <TableRow className="h-12">
      <TableCell className="py-0">
        <Avatar className="h-8 w-8">
          {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={fullName} />}
          <AvatarFallback className="text-xs">{getInitials(fullName)}</AvatarFallback>
        </Avatar>
      </TableCell>
      <TableCell className="py-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span>{fullName}</span>
            {isAdmin && (
              <Badge variant="outline" className="border-transparent bg-[--color-signature-peach]">
                {t('groups.memberTable.adminBadge')}
              </Badge>
            )}
          </div>
          {memberIsUser && <span className="text-xs text-muted">{member.email}</span>}
        </div>
      </TableCell>
      <TableCell className="py-0">{typeLabel}</TableCell>
      <TableCell className="py-0">
        <StatusBadge isActive={memberIsUser ? member.isActive : true} />
      </TableCell>
      <TableCell className="space-x-2 py-0 text-right">
        {!memberIsUser && (
          <Button variant="ghost" size="icon" onClick={() => onEditNonAccountMember(member)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">{t('repositories.common.edit')}</span>
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={() => onRemove(member)}>
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">{t('groups.memberTable.remove')}</span>
        </Button>
      </TableCell>
    </TableRow>
  )
}
