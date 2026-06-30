import { APP_CONFIG } from '@/config/app.config'
import type { Appointment } from '@/types'

export function getUpcomingAppointments(
  appointments: Appointment[],
  withinDays: number = APP_CONFIG.dashboard.upcomingAppointmentsDays,
  groupId?: string
): Appointment[] {
  const now = new Date()
  const cutoff = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000)

  return appointments
    .filter((a) => {
      if (a.status !== 'scheduled') return false
      const scheduledAt = new Date(a.scheduledAt)
      if (scheduledAt < now || scheduledAt > cutoff) return false
      if (groupId !== undefined && a.groupId !== groupId) return false
      return true
    })
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
}
