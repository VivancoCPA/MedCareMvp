import '@/styles/globals.css'
import '@/i18n'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/router'
import { useThemeStore } from '@/stores/theme.store'
import { Toaster } from '@/components/ui/toaster'

// Apply stored theme before first render
const storedTheme = useThemeStore.getState().theme
if (storedTheme === 'dark') {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>
)
