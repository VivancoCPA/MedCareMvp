import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Ban, RotateCcw } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Doctor, Specialty } from '@/types'

type StatusFilter = 'all' | 'active' | 'inactive'

interface DoctorListProps {
  doctors: Doctor[]
  specialties: Specialty[]
  isLoading: boolean
  onEdit: (doctor: Doctor) => void
  onDeactivate: (doctor: Doctor) => void
  onReactivate: (doctor: Doctor) => void
}

export function DoctorList({ doctors, specialties, isLoading, onEdit, onDeactivate, onReactivate }: DoctorListProps) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(handle)
  }, [search])

  const specialtyNameById = useMemo(() => {
    const map = new Map<string, string>()
    specialties.forEach((specialty) => map.set(specialty.id, specialty.name))
    return map
  }, [specialties])

  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase()
    return doctors.filter((doctor) => {
      const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase()
      const matchesSearch = !term || fullName.includes(term)
      const matchesStatus = status === 'all' || (status === 'active' ? doctor.isActive : !doctor.isActive)
      return matchesSearch && matchesStatus
    })
  }, [doctors, debouncedSearch, status])

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
              <TableHead>{t('repositories.doctors.columns.name')}</TableHead>
              <TableHead>{t('repositories.doctors.columns.specialty')}</TableHead>
              <TableHead>{t('repositories.doctors.columns.phone')}</TableHead>
              <TableHead>{t('repositories.doctors.columns.origin')}</TableHead>
              <TableHead>{t('repositories.doctors.columns.status')}</TableHead>
              <TableHead className="text-right">{t('repositories.common.actionsColumn')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((doctor) => (
              <TableRow key={doctor.id}>
                <TableCell>{doctor.firstName} {doctor.lastName}</TableCell>
                <TableCell>{specialtyNameById.get(doctor.specialtyId) ?? '—'}</TableCell>
                <TableCell>{doctor.phone ?? '—'}</TableCell>
                <TableCell>
                  {doctor.originGroupId ? (
                    <Badge variant="outline" className="border-transparent bg-[--color-signature-peach]">
                      {t('repositories.common.originPropagated')}
                    </Badge>
                  ) : (
                    <span className="text-muted">{t('repositories.common.originSuperAdmin')}</span>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge isActive={doctor.isActive} />
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(doctor)}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">{t('repositories.common.edit')}</span>
                  </Button>
                  {doctor.isActive ? (
                    <Button variant="ghost" size="icon" onClick={() => onDeactivate(doctor)}>
                      <Ban className="h-4 w-4" />
                      <span className="sr-only">{t('repositories.common.deactivate')}</span>
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" onClick={() => onReactivate(doctor)}>
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
