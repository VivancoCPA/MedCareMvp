import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Ban, RotateCcw } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
import { getInitials } from '@/lib/utils'
import { usePagination } from '@/hooks/usePagination'
import type { Insurer } from '@/types'

type StatusFilter = 'all' | 'active' | 'inactive'

interface InsurerListProps {
  insurers: Insurer[]
  isLoading: boolean
  onEdit: (insurer: Insurer) => void
  onDeactivate: (insurer: Insurer) => void
  onReactivate: (insurer: Insurer) => void
}

export function InsurerList({ insurers, isLoading, onEdit, onDeactivate, onReactivate }: InsurerListProps) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(handle)
  }, [search])

  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase()
    return insurers.filter((insurer) => {
      const matchesSearch = !term || insurer.name.toLowerCase().includes(term)
      const matchesStatus = status === 'all' || (status === 'active' ? insurer.isActive : !insurer.isActive)
      return matchesSearch && matchesStatus
    })
  }, [insurers, debouncedSearch, status])

  const { page, setPage, totalPages, paginated } = usePagination(filtered)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('repositories.common.searchPlaceholder')}
          className="sm:max-w-xs"
        />
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
        <EmptyState
          title={t('repositories.common.emptyStateTitle')}
          description={t('repositories.common.emptyStateDescription')}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>{t('repositories.insurers.columns.name')}</TableHead>
              <TableHead>{t('repositories.insurers.columns.emergencyPhone')}</TableHead>
              <TableHead>{t('repositories.insurers.columns.website')}</TableHead>
              <TableHead>{t('repositories.insurers.columns.status')}</TableHead>
              <TableHead className="text-right">{t('repositories.common.actionsColumn')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((insurer) => (
              // h-12 is the app-wide row-height standard (48px), applied identically across all five catalogs
              <TableRow key={insurer.id} className="h-12">
                <TableCell className="py-0">
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-muted">
                    {insurer.logoUrl ? (
                      <img
                        src={insurer.logoUrl}
                        alt={t('repositories.insurers.logoAlt')}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] font-medium text-ink">{getInitials(insurer.name)}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-0">{insurer.name}</TableCell>
                <TableCell className="py-0">{insurer.emergencyPhone ?? '—'}</TableCell>
                <TableCell className="py-0">
                  {insurer.website ? (
                    <a
                      href={insurer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link hover:underline"
                    >
                      {insurer.website}
                    </a>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell className="py-0">
                  <StatusBadge isActive={insurer.isActive} />
                </TableCell>
                <TableCell className="space-x-2 py-0 text-right">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(insurer)}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">{t('repositories.common.edit')}</span>
                  </Button>
                  {insurer.isActive ? (
                    <Button variant="ghost" size="icon" onClick={() => onDeactivate(insurer)}>
                      <Ban className="h-4 w-4" />
                      <span className="sr-only">{t('repositories.common.deactivate')}</span>
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" onClick={() => onReactivate(insurer)}>
                      <RotateCcw className="h-4 w-4" />
                      <span className="sr-only">{t('repositories.common.reactivate')}</span>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
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
  )
}
