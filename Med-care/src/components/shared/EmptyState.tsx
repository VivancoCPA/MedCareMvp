import { Inbox, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center bg-cream p-12 text-center">
      <Icon className="h-12 w-12 text-muted" />
      <p className="mt-4 text-lg text-ink">{title}</p>
      {description && <p className="mt-1 text-sm text-body">{description}</p>}
      {action && (
        <Button variant="outline" className="mt-6" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
