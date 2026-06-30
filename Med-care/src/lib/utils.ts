import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { APP_CONFIG } from '@/config/app.config'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso))
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  const { allowedMimeTypes, maxPdfSizeBytes, maxImageSizeBytes } = APP_CONFIG.upload

  if (!allowedMimeTypes.includes(file.type)) {
    return { valid: false, error: 'file_type_not_allowed' }
  }

  if (file.type === 'application/pdf' && file.size > maxPdfSizeBytes) {
    return { valid: false, error: 'file_too_large' }
  }

  if (file.type.startsWith('image/') && file.size > maxImageSizeBytes) {
    return { valid: false, error: 'file_too_large' }
  }

  return { valid: true }
}
