import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Ban, RotateCcw } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { UserStatusBadge } from './UserStatusBadge'
import { usersService } from '../services/users.service'
import { getInitials, formatDate } from '@/lib/utils'
import { usePagination } from '@/hooks/usePagination'
import { useAuth } from '@/hooks/useAuth'
import type { User, UserRole } from '@/types'

type RoleFilter = 'all' | UserRole
type StatusFilter = 'all' | 'active' | 'inactive'

interface UserListProps {
  users: User[]
  isLoading: boolean
  onEdit: (user: User) => void
  onDeactivate: (user: User) => void
  onReactivate: (user: User) => void
}

export function UserList({ users, isLoading, onEdit, onDeactivate, onReactivate }: UserListProps) {
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [role, setRole] = useState<RoleFilter>('all')
  const [status, setStatus] = useState<StatusFilter>('all')

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(handle)
  }, [search])

  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase()
    return users.filter((u) => {
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase()
      const matchesSearch = !term || fullName.includes(term) || u.email.toLowerCase().includes(term)
      const matchesRole = role === 'all' || u.role === role
      const matchesStatus = status === 'all' || (status === 'active' ? u.isActive : !u.isActive)
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, debouncedSearch, role, status])

  const { page, setPage, totalPages, paginated } = usePagination(filtered)

  return (
    <TooltipProvider>
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('users.searchPlaceholder')}
          className="sm:max-w-xs"
        />
        <Select value={role} onValueChange={(v) => setRole(v as RoleFilter)}>
          <SelectTrigger className="sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('repositories.common.statusAll')}</SelectItem>
            <SelectItem value="superadmin">{t('users.roles.superadmin')}</SelectItem>
            <SelectItem value="admin">{t('users.roles.admin')}</SelectItem>
            <SelectItem value="member">{t('users.roles.member')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
          <SelectTrigger className="sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('repositories.common.statusAll')}</SelectItem>
            <SelectItem value="active">{t('repositories.common.statusActive')}</SelectItem>
            <SelectItem value="inactive">{t('repositories.common.statusInactive')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title={t('users.emptyStateTitle')} description={t('users.emptyStateDescription')} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>{t('users.columns.user')}</TableHead>
              <TableHead>{t('users.columns.role')}</TableHead>
              <TableHead>{t('users.columns.group')}</TableHead>
              <TableHead>{t('users.columns.origin')}</TableHead>
              <TableHead>{t('users.columns.status')}</TableHead>
              <TableHead>{t('users.columns.createdAt')}</TableHead>
              <TableHead className="text-right">{t('repositories.common.actionsColumn')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((u) => {
              const isSelf = u.id === currentUser?.id
              const isOtherSuperadmin = u.role === 'superadmin' && !isSelf
              const groupNames = usersService.getGroupNamesForUser(u.id)

              return (
                <TableRow key={u.id} className="h-12">
                  <TableCell className="py-0">
                    <Avatar className="h-8 w-8">
                      {u.avatarUrl && <AvatarImage src={u.avatarUrl} alt={t('users.avatarAlt')} />}
                      <AvatarFallback className="text-xs">
                        {getInitials(`${u.firstName} ${u.lastName}`)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="py-0">
                    <div className="flex flex-col">
                      <span>{u.firstName} {u.lastName}</span>
                      <span className="text-xs text-muted">{u.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-0">
                    <UserStatusBadge role={u.role} />
                  </TableCell>
                  <TableCell className="py-0">
                    {groupNames.length > 0 ? groupNames.join(', ') : t('users.noGroup')}
                  </TableCell>
                  <TableCell className="py-0">
                    {u.originAdminId ? (
                      <Badge variant="outline" className="border-transparent bg-[--color-signature-peach]">
                        {t('repositories.common.originPropagated')}
                      </Badge>
                    ) : (
                      <span className="text-muted">{t('repositories.common.originSuperAdmin')}</span>
                    )}
                  </TableCell>
                  <TableCell className="py-0">
                    <StatusBadge isActive={u.isActive} />
                  </TableCell>
                  <TableCell className="py-0">{formatDate(u.createdAt)}</TableCell>
                  <TableCell className="space-x-2 py-0 text-right">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(u)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">{t('repositories.common.edit')}</span>
                    </Button>
                    {!isOtherSuperadmin &&
                      (u.isActive ? (
                        isSelf ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-block">
                                <Button variant="ghost" size="icon" disabled>
                                  <Ban className="h-4 w-4" />
                                  <span className="sr-only">{t('repositories.common.deactivate')}</span>
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>{t('users.tooltips.cannotDeactivateSelf')}</TooltipContent>
                          </Tooltip>
                        ) : (
                          <Button variant="ghost" size="icon" onClick={() => onDeactivate(u)}>
                            <Ban className="h-4 w-4" />
                            <span className="sr-only">{t('repositories.common.deactivate')}</span>
                          </Button>
                        )
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => onReactivate(u)}>
                          <RotateCcw className="h-4 w-4" />
                          <span className="sr-only">{t('repositories.common.reactivate')}</span>
                        </Button>
                      ))}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage(Math.max(1, page - 1))}
                aria-disabled={page === 1}
                className={page === 1 ? 'pointer-events-none opacity-50' : undefined}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <PaginationItem key={pageNumber}>
                <PaginationLink isActive={pageNumber === page} onClick={() => setPage(pageNumber)}>
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                aria-disabled={page === totalPages}
                className={page === totalPages ? 'pointer-events-none opacity-50' : undefined}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
    </TooltipProvider>
  )
}
