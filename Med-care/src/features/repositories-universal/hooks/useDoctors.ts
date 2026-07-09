import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { doctorsService, type DoctorCreateDTO, type DoctorUpdateDTO } from '../services/doctors.service'
import { useToast } from '@/hooks/useToast'

const DOCTORS_QUERY_KEY = ['doctors']

export function useDoctors() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const entity = t('repositories.doctors.entityName')

  const query = useQuery({
    queryKey: DOCTORS_QUERY_KEY,
    queryFn: doctorsService.getAll,
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: DOCTORS_QUERY_KEY })
  }

  const createMutation = useMutation({
    mutationFn: (data: DoctorCreateDTO) => doctorsService.create(data),
    onSuccess: () => {
      invalidate()
      toast({ title: t('repositories.common.toastCreateSuccess', { entity }) })
    },
    onError: () => toast({ variant: 'destructive', title: t('repositories.common.toastError') }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DoctorUpdateDTO }) => doctorsService.update(id, data),
    onSuccess: () => {
      invalidate()
      toast({ title: t('repositories.common.toastUpdateSuccess', { entity }) })
    },
    onError: () => toast({ variant: 'destructive', title: t('repositories.common.toastError') }),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => doctorsService.deactivate(id),
    onSuccess: () => {
      invalidate()
      toast({ title: t('repositories.common.toastDeactivateSuccess', { entity }) })
    },
    onError: () => toast({ variant: 'destructive', title: t('repositories.common.toastError') }),
  })

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => doctorsService.reactivate(id),
    onSuccess: () => {
      invalidate()
      toast({ title: t('repositories.common.toastReactivateSuccess', { entity }) })
    },
    onError: () => toast({ variant: 'destructive', title: t('repositories.common.toastError') }),
  })

  return {
    doctors: query.data ?? [],
    isLoading: query.isLoading,
    createDoctor: createMutation.mutateAsync,
    updateDoctor: updateMutation.mutateAsync,
    deactivateDoctor: deactivateMutation.mutateAsync,
    reactivateDoctor: reactivateMutation.mutateAsync,
  }
}
