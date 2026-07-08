import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/authContext'

export function AuthLoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-6 text-foreground transition-colors duration-500">
      <div className="text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-foreground text-background font-black">S</div>
        <p className="text-sm font-semibold text-muted">Restoring your StudySpark session...</p>
      </div>
    </div>
  )
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoading, session } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <AuthLoadingScreen />
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isLoading, session } = useAuth()
  const location = useLocation()
  let fromPath = typeof location.state?.from?.pathname === 'string' ? location.state.from.pathname : '/dashboard'
  if (!fromPath.startsWith('/') || fromPath.startsWith('//')) {
    fromPath = '/dashboard'
  }

  if (isLoading) {
    return <AuthLoadingScreen />
  }

  if (session) {
    return <Navigate to={fromPath} replace />
  }

  return children
}
