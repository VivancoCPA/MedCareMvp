import type { ReactNode } from 'react'

interface PageWrapperProps {
  children?: ReactNode
}

export function PageWrapper({ children }: PageWrapperProps) {
  return <div className="mx-auto w-full max-w-[1280px] p-4 md:p-6">{children}</div>
}
