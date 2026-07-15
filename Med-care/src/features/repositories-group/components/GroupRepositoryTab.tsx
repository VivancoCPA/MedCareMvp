import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Ban, Plus } from 'lucide-react'
import { useGroupRepository } from '../hooks/useGroupRepository'
import { useDeactivateGroupRepositoryEntry } from '../hooks/useDeactivateGroupRepositoryEntry'
import { ImportEntityModal } from './ImportEntityModal'
import { CreateOwnEntryModal } from './CreateOwnEntryModal'
import type { GroupRepoEntityType, GroupRepositoryEntry } from '../services/group-repositories.service'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import { usePagination } from '@/hooks/usePagination'
import { useSpecialties } from '@/features/repositories-universal/hooks/useSpecialties'
import type { Doctor, MedicalCenter, Pharmacy, Insurer } from '@/types'

interface GroupRepositoryTabProps {
  groupId: string
  entityType: GroupRepoEntityType
}

function getEntryName(entry: GroupRepositoryEntry, entityType: GroupRepoEntityType): string {
  if (entityType === 'doctor') {
    const doctor = entry.entity as Doctor
    return `${doctor.firstName} ${doctor.lastName}`
  }
  return (entry.entity as MedicalCenter | Pharmacy | Insurer).name
}

export function GroupRepositoryTab({ groupId, entityType }: GroupRepositoryTabProps) {
  const { t } = useTranslation()
  const { entries, isLoading } = useGroupRepository(groupId, entityType)
  const { deactivateEntry, isPending: isDeactivating } = useDeactivateGroupRepositoryEntry(groupId, entityType)
  const { specialties } = useSpecialties()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [importOpen, setImportOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [deactivateTarget, setDeactivateTarget] = useState<GroupRepositoryEntry | null>(null)

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(handle)
  }, [search])

  const specialtyNameById = useMemo(() => {
    const map = new Map<string, string>()
    specialties.forEach((s) => map.set(s.id, s.name))
    return map
  }, [specialties])

  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase()
    if (!term) return entries
    return entries.filter((entry) => getEntryName(entry, entityType).toLowerCase().includes(term))
  }, [entries, debouncedSearch, entityType])

  const { page, setPage, totalPages, paginated } = usePagination(filtered)

  function col2Label(): string {
    switch (entityType) {
      case 'doctor':
        return t('repositories.doctors.columns.specialty')
      case 'medicalCenter':
        return t('repositories.medicalCenters.columns.type')
      case 'pharmacy':
        return t('repositories.pharmacies.columns.address')
      case 'insurer':
        return t('repositories.insurers.columns.emergencyPhone')
    }
  }

  function col3Label(): string {
    switch (entityType) {
      case 'doctor':
        return t('repositories.doctors.columns.phone')
      case 'medicalCenter':
        return t('repositories.medicalCenters.columns.address')
      case 'pharmacy':
        return t('repositories.pharmacies.columns.phone')
      case 'insurer':
        return t('repositories.insurers.columns.website')
    }
  }

  function col2Value(entry: GroupRepositoryEntry): string {
    switch (entityType) {
      case 'doctor':
        return specialtyNameById.get((entry.entity as Doctor).specialtyId) ?? '—'
      case 'medicalCenter':
        return t(`repositories.medicalCenters.types.${(entry.entity as MedicalCenter).type}`)
      case 'pharmacy':
        return (entry.entity as Pharmacy).address ?? '—'
      case 'insurer':
        return (entry.entity as Insurer).emergencyPhone ?? '—'
    }
  }

  function col3Value(entry: GroupRepositoryEntry): string {
    switch (entityType) {
      case 'doctor':
        return (entry.entity as Doctor).phone ?? '—'
      case 'medicalCenter':
        return (entry.entity as MedicalCenter).address ?? '—'
      case 'pharmacy':
        return (entry.entity as Pharmacy).phone ?? '—'
      case 'insurer':
        return (entry.entity as Insurer).website ?? '—'
    }
  }

  async function handleConfirmDeactivate() {
    if (!deactivateTarget) return
    await deactivateEntry(deactivateTarget.entryId)
    setDeactivateTarget(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('repositories.common.searchPlaceholder')}
          className="sm:max-w-xs"
        />
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => setImportOpen(true)}>
            {t('groupRepositories.common.importButton')}
          </Button>
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            {t('groupRepositories.common.createButton')}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={t('groupRepositories.common.emptyStateTitle')}
          description={t('groupRepositories.common.emptyStateDescription')}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('repositories.doctors.columns.name')}</TableHead>
              <TableHead>{col2Label()}</TableHead>
              <TableHead>{col3Label()}</TableHead>
              <TableHead>{t('repositories.doctors.columns.origin')}</TableHead>
              <TableHead className="text-right">{t('repositories.common.actionsColumn')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((entry) => (
              <TableRow key={entry.entryId} className="h-12">
                <TableCell className="py-0">{getEntryName(entry, entityType)}</TableCell>
                <TableCell className="py-0">{col2Value(entry)}</TableCell>
                <TableCell className="py-0">{col3Value(entry)}</TableCell>
                <TableCell className="py-0">
                  {entry.entity.originGroupId ? (
                    <Badge variant="outline" className="border-transparent bg-[--color-signature-peach]">
                      {t('repositories.common.originPropagated')}
                    </Badge>
                  ) : (
                    <span className="text-muted">{t('repositories.common.originSuperAdmin')}</span>
                  )}
                </TableCell>
                <TableCell className="py-0 text-right">
                  <Button variant="ghost" size="icon" onClick={() => setDeactivateTarget(entry)}>
                    <Ban className="h-4 w-4" />
                    <span className="sr-only">{t('repositories.common.deactivate')}</span>
                  </Button>
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

      <ImportEntityModal open={importOpen} groupId={groupId} entityType={entityType} onClose={() => setImportOpen(false)} />
      <CreateOwnEntryModal open={createOpen} groupId={groupId} entityType={entityType} onClose={() => setCreateOpen(false)} />

      <ConfirmModal
        open={!!deactivateTarget}
        title={t('groupRepositories.common.confirmDeactivateTitle')}
        message={t('groupRepositories.common.confirmDeactivateMessage', {
          name: deactivateTarget ? getEntryName(deactivateTarget, entityType) : '',
        })}
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setDeactivateTarget(null)}
        isLoading={isDeactivating}
      />
    </div>
  )
}
