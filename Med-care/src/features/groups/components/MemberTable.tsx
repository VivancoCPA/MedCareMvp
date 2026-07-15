import { useTranslation } from 'react-i18next'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { MemberRow } from './MemberRow'
import { usePagination } from '@/hooks/usePagination'
import type { Group, NonAccountMember, User } from '@/types'

interface MemberTableProps {
  group: Group
  members: Array<User | NonAccountMember>
  isLoading: boolean
  onEditNonAccountMember: (member: NonAccountMember) => void
  onRemove: (member: User | NonAccountMember) => void
}

export function MemberTable({ group, members, isLoading, onEditNonAccountMember, onRemove }: MemberTableProps) {
  const { t } = useTranslation()
  const { page, setPage, totalPages, paginated } = usePagination(members)

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <EmptyState
        title={t('groups.memberTable.emptyTitle')}
        description={t('groups.memberTable.emptyDescription')}
      />
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" />
            <TableHead>{t('groups.memberTable.columns.name')}</TableHead>
            <TableHead>{t('groups.memberTable.columns.type')}</TableHead>
            <TableHead>{t('groups.memberTable.columns.status')}</TableHead>
            <TableHead className="text-right">{t('repositories.common.actionsColumn')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              isAdmin={member.id === group.adminId}
              onEditNonAccountMember={onEditNonAccountMember}
              onRemove={onRemove}
            />
          ))}
        </TableBody>
      </Table>

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
  )
}
