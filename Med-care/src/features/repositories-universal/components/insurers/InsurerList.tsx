import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Ban, RotateCcw } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
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
              <TableHead>{t('repositories.insurers.columns.name')}</TableHead>
              <TableHead>{t('repositories.insurers.columns.emergencyPhone')}</TableHead>
              <TableHead>{t('repositories.insurers.columns.website')}</TableHead>
              <TableHead>{t('repositories.insurers.columns.status')}</TableHead>
              <TableHead className="text-right">{t('repositories.common.actionsColumn')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((insurer) => (
              <TableRow key={insurer.id}>
                <TableCell>{insurer.name}</TableCell>
                <TableCell>{insurer.emergencyPhone ?? '—'}</TableCell>
                <TableCell>
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
                <TableCell>
                  <StatusBadge isActive={insurer.isActive} />
                </TableCell>
                <TableCell className="space-x-2 text-right">
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
    </div>
  )
}
