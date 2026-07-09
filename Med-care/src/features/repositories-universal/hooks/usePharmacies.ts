import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { pharmaciesService, type PharmacyCreateDTO, type PharmacyUpdateDTO } from '../services/pharmacies.service'
import { useToast } from '@/hooks/useToast'

const PHARMACIES_QUERY_KEY = ['pharmacies']

export function usePharmacies() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const entity = t('repositories.pharmacies.entityName')

  const query = useQuery({
    queryKey: PHARMACIES_QUERY_KEY,
    queryFn: pharmaciesService.getAll,
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: PHARMACIES_QUERY_KEY })
  }

  const createMutation = useMutation({
    mutationFn: (data: PharmacyCreateDTO) => pharmaciesService.create(data),
    onSuccess: () => {
      invalidate()
      toast({ title: t('repositories.common.toastCreateSuccess', { entity }) })
    },
    onError: () => toast({ variant: 'destructive', title: t('repositories.common.toastError') }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PharmacyUpdateDTO }) => pharmaciesService.update(id, data),
    onSuccess: () => {
      invalidate()
      toast({ title: t('repositories.common.toastUpdateSuccess', { entity }) })
    },
    onError: () => toast({ variant: 'destructive', title: t('repositories.common.toastError') }),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => pharmaciesService.deactivate(id),
    onSuccess: () => {
      invalidate()
      toast({ title: t('repositories.common.toastDeactivateSuccess', { entity }) })
    },
    onError: () => toast({ variant: 'destructive', title: t('repositories.common.toastError') }),
  })

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => pharmaciesService.reactivate(id),
    onSuccess: () => {
      invalidate()
      toast({ title: t('repositories.common.toastReactivateSuccess', { entity }) })
    },
    onError: () => toast({ variant: 'destructive', title: t('repositories.common.toastError') }),
  })

  return {
    pharmacies: query.data ?? [],
    isLoading: query.isLoading,
    createPharmacy: createMutation.mutateAsync,
    updatePharmacy: updateMutation.mutateAsync,
    deactivatePharmacy: deactivateMutation.mutateAsync,
    reactivatePharmacy: reactivateMutation.mutateAsync,
  }
}
