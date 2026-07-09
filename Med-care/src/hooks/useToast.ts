import { toast as shadcnToast } from '@/hooks/use-toast'

interface ToastOptions {
  variant?: 'default' | 'destructive'
  title: string
  description?: string
}

export function useToast() {
  return {
    toast: ({ variant = 'default', title, description }: ToastOptions) =>
      shadcnToast({ variant, title, description }),
  }
}
