import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { APP_CONFIG } from '@/config/app.config'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  updatePassword: (newPassword: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login(user) {
        set({ user, isAuthenticated: true })
      },
      logout() {
        set({ user: null, isAuthenticated: false })
      },
      updatePassword(newPassword) {
        const { user } = get()
        if (user) {
          set({ user: { ...user, passwordHash: newPassword } })
        }
      },
    }),
    {
      name: APP_CONFIG.session.storageKey,
    }
  )
)
