import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AddAccountMemberForm } from './AddAccountMemberForm'
import { AddNonAccountMemberForm } from './AddNonAccountMemberForm'

interface AddMemberTabsProps {
  groupId: string
  adminId: string
  onDone: () => void
}

export function AddMemberTabs({ groupId, adminId, onDone }: AddMemberTabsProps) {
  const { t } = useTranslation()

  return (
    <Tabs defaultValue="account" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account" className="text-ink">
          {t('groups.addMember.tabs.account')}
        </TabsTrigger>
        <TabsTrigger value="nonAccount" className="text-ink">
          {t('groups.addMember.tabs.nonAccount')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <AddAccountMemberForm groupId={groupId} adminId={adminId} onDone={onDone} />
      </TabsContent>
      <TabsContent value="nonAccount">
        <AddNonAccountMemberForm groupId={groupId} onDone={onDone} />
      </TabsContent>
    </Tabs>
  )
}
