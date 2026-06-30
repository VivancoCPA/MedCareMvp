import { Heart } from 'lucide-react'

interface AuthLayoutProps {
  subtitle: string
  children: React.ReactNode
}

export function AuthLayout({ subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        <div className="bg-canvas rounded-xl shadow-sm border border-border p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-3">
              <Heart className="w-6 h-6 text-on-primary" />
            </div>
            <h1 className="text-xl font-semibold text-ink">MedFamilyCare</h1>
            <p className="text-sm text-ink/60 mt-1 text-center">{subtitle}</p>
          </div>
          {children}
        </div>
        <p className="text-center text-xs text-ink/40 mt-4">© 2026 MedFamilyCare</p>
      </div>
    </div>
  )
}
