import { useEffect, useMemo, useState } from 'react'
import { APP_CONFIG } from '@/config/app.config'

export function usePagination<T>(items: T[], pageSize: number = APP_CONFIG.pagination.defaultPageSize) {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [items.length])

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, page, pageSize])

  return { page, setPage, totalPages, paginated }
}
