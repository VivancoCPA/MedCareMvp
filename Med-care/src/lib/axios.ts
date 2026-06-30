import axios from 'axios'
import { APP_CONFIG } from '@/config/app.config'

const apiClient = axios.create({
  baseURL: APP_CONFIG.api.baseUrl,
})

apiClient.interceptors.request.use((config) => {
  const raw = localStorage.getItem(APP_CONFIG.session.storageKey)
  if (raw) {
    try {
      const session = JSON.parse(raw) as { state?: { user?: { passwordHash?: string } } }
      const token = session?.state?.user?.passwordHash
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
    } catch {
      // invalid session, skip auth header
    }
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const status = (error as { response?: { status?: number } })?.response?.status
    if (status === 401) {
      const { useAuthStore } = await import('@/stores/auth.store')
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

export default apiClient
