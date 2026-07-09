import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { insurersService, type InsurerCreateDTO, type InsurerUpdateDTO } from '../services/insurers.service'
import { useToast } from '@/hooks/useToast'

const INSURERS_QUERY_KEY = ['insurers']

export function useInsurers() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const entity = t('repositories.insurers.entityName')

  const query = useQuery({
    queryKey: INSURERS_QUERY_KEY,
    queryFn: insurersService.getAll,
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: INSURERS_QUERY_KEY })
  }

  const createMutation = useMutation({
    mutationFn: (data: InsurerCreateDTO) => insurersService.create(data),
    onSuccess: () => {
      invalidate()
      toast({ title: t('repositories.common.toastCreateSuccess', { entity }) })
    },
    onError: () => toast({ variant: 'destructive', title: t('repositories.common.toastError') }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InsurerUpdateDTO }) => insurersService.update(id, data),
    onSuccess: () => {
      invalidate()
      toast({ title: t('repositories.common.toastUpdateSuccess', { entity }) })
    },
    onError: () => toast({ variant: 'destructive', title: t('repositories.common.toastError') }),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => insurersService.deactivate(id),
    onSuccess: () => {
      invalidate()
      toast({ title: t('repositories.common.toastDeactivateSuccess', { entity }) })
    },
    onError: () => toast({ variant: 'destructive', title: t('repositories.common.toastError') }),
  })

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => insurersService.reactivate(id),
    onSuccess: () => {
      invalidate()
      toast({ title: t('repositories.common.toastReactivateSuccess', { entity }) })
    },
    onError: () => toast({ variant: 'destructive', title: t('repositories.common.toastError') }),
  })

  return {
    insurers: query.data ?? [],
    isLoading: query.isLoading,
    createInsurer: createMutation.mutateAsync,
    updateInsurer: updateMutation.mutateAsync,
    deactivateInsurer: deactivateMutation.mutateAsync,
    reactivateInsurer: reactivateMutation.mutateAsync,
  }
}
