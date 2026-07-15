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
import { usePagination } from '@/hooks/usePagination'
import type { Pharmacy } from '@/types'

type StatusFilter = 'all' | 'active' | 'inactive'

interface PharmacyListProps {
  pharmacies: Pharmacy[]
  isLoading: boolean
  onEdit: (pharmacy: Pharmacy) => void
  onDeactivate: (pharmacy: Pharmacy) => void
  onReactivate: (pharmacy: Pharmacy) => void
}

export function PharmacyList({ pharmacies, isLoading, onEdit, onDeactivate, onReactivate }: PharmacyListProps) {
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
    return pharmacies.filter((pharmacy) => {
      const matchesSearch = !term || pharmacy.name.toLowerCase().includes(term)
      const matchesStatus = status === 'all' || (status === 'active' ? pharmacy.isActive : !pharmacy.isActive)
      return matchesSearch && matchesStatus
    })
  }, [pharmacies, debouncedSearch, status])

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
              <TableHead>{t('repositories.pharmacies.columns.name')}</TableHead>
              <TableHead>{t('repositories.pharmacies.columns.address')}</TableHead>
              <TableHead>{t('repositories.pharmacies.columns.phone')}</TableHead>
              <TableHead>{t('repositories.pharmacies.columns.status')}</TableHead>
              <TableHead className="text-right">{t('repositories.common.actionsColumn')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((pharmacy) => (
              // h-12 is the app-wide row-height standard (48px), applied identically across all five catalogs
              <TableRow key={pharmacy.id} className="h-12">
                <TableCell className="py-0">{pharmacy.name}</TableCell>
                <TableCell className="py-0">{pharmacy.address ?? '—'}</TableCell>
                <TableCell className="py-0">{pharmacy.phone ?? '—'}</TableCell>
                <TableCell className="py-0">
                  <StatusBadge isActive={pharmacy.isActive} />
                </TableCell>
                <TableCell className="space-x-2 py-0 text-right">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(pharmacy)}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">{t('repositories.common.edit')}</span>
                  </Button>
                  {pharmacy.isActive ? (
                    <Button variant="ghost" size="icon" onClick={() => onDeactivate(pharmacy)}>
                      <Ban className="h-4 w-4" />
                      <span className="sr-only">{t('repositories.common.deactivate')}</span>
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" onClick={() => onReactivate(pharmacy)}>
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
