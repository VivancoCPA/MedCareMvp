import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react'
import { importSelectionSchema } from '../schemas/import-selection.schema'
import { useImportCandidates } from '../hooks/useImportCandidates'
import { useImportToGroupRepository } from '../hooks/useImportToGroupRepository'
import type { GroupRepoEntityType } from '../services/group-repositories.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils'
import type { Doctor, MedicalCenter, Pharmacy, Insurer } from '@/types'

type ImportCandidate = Doctor | MedicalCenter | Pharmacy | Insurer

interface ImportEntityModalProps {
  open: boolean
  groupId: string
  entityType: GroupRepoEntityType
  onClose: () => void
}

function getCandidateName(candidate: ImportCandidate, entityType: GroupRepoEntityType): string {
  if (entityType === 'doctor') {
    const doctor = candidate as Doctor
    return `${doctor.firstName} ${doctor.lastName}`
  }
  return (candidate as MedicalCenter | Pharmacy | Insurer).name
}

export function ImportEntityModal({ open, groupId, entityType, onClose }: ImportEntityModalProps) {
  const { t } = useTranslation()
  const { candidates, isLoading } = useImportCandidates(groupId, entityType)
  const { importEntity, isPending } = useImportToGroupRepository(groupId, entityType)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [popoverOpen, setPopoverOpen] = useState(false)

  function handleClose() {
    setSelectedIds([])
    onClose()
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const parsed = importSelectionSchema.safeParse({ selectedIds })

  async function handleConfirm() {
    if (!parsed.success) return
    for (const id of selectedIds) {
      await importEntity(id)
    }
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('groupRepositories.common.importModalTitle')}</DialogTitle>
        </DialogHeader>

        {!isLoading && candidates.length === 0 ? (
          <EmptyState
            title={t('groupRepositories.common.importEmptyTitle')}
            description={t('groupRepositories.common.importEmptyDescription')}
          />
        ) : (
          <div className="space-y-3">
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={popoverOpen}
                  className="w-full justify-between font-normal"
                >
                  {selectedIds.length > 0
                    ? t('groupRepositories.common.importSelectedCount', { count: selectedIds.length })
                    : t('groupRepositories.common.importSearchPlaceholder')}
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder={t('groupRepositories.common.importSearchPlaceholder')} />
                  <CommandList>
                    <CommandEmpty>{t('groupRepositories.common.importNoResults')}</CommandEmpty>
                    <CommandGroup>
                      {candidates.map((candidate) => {
                        const name = getCandidateName(candidate, entityType)
                        return (
                          <CommandItem key={candidate.id} value={name} onSelect={() => toggleSelected(candidate.id)}>
                            <Check
                              className={cn('h-4 w-4', selectedIds.includes(candidate.id) ? 'opacity-100' : 'opacity-0')}
                            />
                            <span className="flex-1 truncate">{name}</span>
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {selectedIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedIds.map((id) => {
                  const candidate = candidates.find((c) => c.id === id)
                  if (!candidate) return null
                  return (
                    <Badge key={id} variant="secondary" className="gap-1 pr-1">
                      {getCandidateName(candidate, entityType)}
                      <button type="button" onClick={() => toggleSelected(id)} className="ml-1 rounded-full hover:bg-black/10">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
            {t('repositories.common.cancel')}
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!parsed.success || isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('groupRepositories.common.importConfirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
