import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  specialtiesService,
  type SpecialtyCreateDTO,
  type SpecialtyUpdateDTO,
} from '../services/specialties.service'
import { useToast } from '@/hooks/useToast'

const SPECIALTIES_QUERY_KEY = ['specialties']

export function useSpecialties() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const entity = t('repositories.specialties.entityName')

  const query = useQuery({
    queryKey: SPECIALTIES_QUERY_KEY,
    queryFn: specialtiesService.getAll,
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: SPECIALTIES_QUERY_KEY })
  }

  const createMutation = useMutation({
    mutationFn: (data: SpecialtyCreateDTO) => specialtiesService.create(data),
    onSuccess: () => {
      invalidate()
      toast({ title: t('repositories.common.toastCreateSuccess', { entity }) })
    },
    onError: () => toast({ variant: 'destructive', title: t('repositories.common.toastError') }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SpecialtyUpdateDTO }) =>
      specialtiesService.update(id, data),
    onSuccess: () => {
      invalidate()
      toast({ title: t('repositories.common.toastUpdateSuccess', { entity }) })
    },
    onError: () => toast({ variant: 'destructive', title: t('repositories.common.toastError') }),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => specialtiesService.deactivate(id),
    onSuccess: () => {
      invalidate()
      toast({ title: t('repositories.common.toastDeactivateSuccess', { entity }) })
    },
    onError: () => toast({ variant: 'destructive', title: t('repositories.common.toastError') }),
  })

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => specialtiesService.reactivate(id),
    onSuccess: () => {
      invalidate()
      toast({ title: t('repositories.common.toastReactivateSuccess', { entity }) })
    },
    onError: () => toast({ variant: 'destructive', title: t('repositories.common.toastError') }),
  })

  return {
    specialties: query.data ?? [],
    isLoading: query.isLoading,
    createSpecialty: createMutation.mutateAsync,
    updateSpecialty: updateMutation.mutateAsync,
    deactivateSpecialty: deactivateMutation.mutateAsync,
    reactivateSpecialty: reactivateMutation.mutateAsync,
  }
}
