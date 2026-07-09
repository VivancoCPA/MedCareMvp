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
import type { Specialty } from '@/types'

type StatusFilter = 'all' | 'active' | 'inactive'

interface SpecialtyListProps {
  specialties: Specialty[]
  isLoading: boolean
  onEdit: (specialty: Specialty) => void
  onDeactivate: (specialty: Specialty) => void
  onReactivate: (specialty: Specialty) => void
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}...` : text
}

export function SpecialtyList({ specialties, isLoading, onEdit, onDeactivate, onReactivate }: SpecialtyListProps) {
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
    return specialties.filter((specialty) => {
      const matchesSearch = !term || specialty.name.toLowerCase().includes(term)
      const matchesStatus = status === 'all' || (status === 'active' ? specialty.isActive : !specialty.isActive)
      return matchesSearch && matchesStatus
    })
  }, [specialties, debouncedSearch, status])

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
              <TableHead>{t('repositories.specialties.columns.name')}</TableHead>
              <TableHead>{t('repositories.specialties.columns.description')}</TableHead>
              <TableHead>{t('repositories.specialties.columns.status')}</TableHead>
              <TableHead className="text-right">{t('repositories.common.actionsColumn')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((specialty) => (
              <TableRow key={specialty.id}>
                <TableCell>{specialty.name}</TableCell>
                <TableCell>{specialty.description ? truncate(specialty.description, 60) : '—'}</TableCell>
                <TableCell>
                  <StatusBadge isActive={specialty.isActive} />
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(specialty)}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">{t('repositories.common.edit')}</span>
                  </Button>
                  {specialty.isActive ? (
                    <Button variant="ghost" size="icon" onClick={() => onDeactivate(specialty)}>
                      <Ban className="h-4 w-4" />
                      <span className="sr-only">{t('repositories.common.deactivate')}</span>
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" onClick={() => onReactivate(specialty)}>
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
