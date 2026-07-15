import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { groupsService } from '../services/groups.service'
import { useToast } from '@/hooks/useToast'
import type { BloodType, Gender, NonAccountMemberType } from '@/types'

interface UpdateNonAccountMemberParams {
  memberId: string
  firstName: string
  lastName: string | null
  memberType: NonAccountMemberType
  birthDate: string | null
  gender: Gender
  breed: string | null
  bloodType: BloodType | null
  avatarUrl: string | null
}

export function useUpdateNonAccountMember(groupId: string | null) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (params: UpdateNonAccountMemberParams) => groupsService.updateNonAccountMember(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] })
      toast({ title: t('groups.editNonAccountMember.toastSuccess') })
    },
    onError: () => {
      toast({ variant: 'destructive', title: t('groups.toastError') })
    },
  })

  return { updateNonAccountMember: mutation.mutateAsync, isPending: mutation.isPending }
}
