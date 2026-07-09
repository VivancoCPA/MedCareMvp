import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  medicalCentersService,
  type MedicalCenterCreateDTO,
  type MedicalCenterUpdateDTO,
} from '../services/medical-centers.service'
import { useToast } from '@/hooks/useToast'

const MEDICAL_CENTERS_QUERY_KEY = ['medical-centers']

export function useMedicalCenters() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const entity = t('repositories.medicalCenters.entityName')

  const query = useQuery({
    queryKey: MEDICAL_CENTERS_QUERY_KEY,
    queryFn: medicalCentersService.getAll,
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: MEDICAL_CENTERS_QUERY_KEY })
  }

  const createMutation = useMutation({
    mutationFn: (data: MedicalCenterCreateDTO) => medicalCentersService.create(data),
    onSuccess: () => {
      invalidate()
      toast({ title: t('repositories.common.toastCreateSuccess', { entity }) })
    },
    onError: () => toast({ variant: 'destructive', title: t('repositories.common.toastError') }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MedicalCenterUpdateDTO }) =>
      medicalCentersService.update(id, data),
    onSuccess: () => {
      invalidate()
      toast({ title: t('repositories.common.toastUpdateSuccess', { entity }) })
    },
    onError: () => toast({ variant: 'destructive', title: t('repositories.common.toastError') }),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => medicalCentersService.deactivate(id),
    onSuccess: () => {
      invalidate()
      toast({ title: t('repositories.common.toastDeactivateSuccess', { entity }) })
    },
    onError: () => toast({ variant: 'destructive', title: t('repositories.common.toastError') }),
  })

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => medicalCentersService.reactivate(id),
    onSuccess: () => {
      invalidate()
      toast({ title: t('repositories.common.toastReactivateSuccess', { entity }) })
    },
    onError: () => toast({ variant: 'destructive', title: t('repositories.common.toastError') }),
  })

  return {
    medicalCenters: query.data ?? [],
    isLoading: query.isLoading,
    createMedicalCenter: createMutation.mutateAsync,
    updateMedicalCenter: updateMutation.mutateAsync,
    deactivateMedicalCenter: deactivateMutation.mutateAsync,
    reactivateMedicalCenter: reactivateMutation.mutateAsync,
  }
}
