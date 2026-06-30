export const APP_CONFIG = {
  api: {
    baseUrl: import.meta.env['VITE_API_BASE_URL'] ?? 'http://localhost:5043/api/',
  },
  upload: {
    maxPdfSizeBytes: 10 * 1024 * 1024,
    maxImageSizeBytes: 5 * 1024 * 1024,
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
  },
  session: {
    storageKey: 'medcare_session',
    themeKey: 'medcare_theme',
  },
  mock: {
    enabled: true,
    simulatedDelayMs: 300,
  },
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50],
  },
  dashboard: {
    upcomingAppointmentsDays: 7,
  },
} as const
