import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredUserType?: 'patient' | 'doctor' | 'admin'
}

export function ProtectedRoute({ children, requiredUserType }: ProtectedRouteProps) {
  const { isAuthenticated, userType, isLoading, user } = useAuth()

  console.log('ProtectedRoute check:', { isAuthenticated, userType, isLoading, requiredUserType, user })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  if (requiredUserType && userType !== requiredUserType) {
    // Redirect to appropriate dashboard
    console.log('Wrong user type, redirecting')
    const redirectPath = userType === 'doctor' ? '/doctor/dashboard' : '/dashboard'
    return <Navigate to={redirectPath} replace />
  }

  console.log('Access granted to protected route')
  return <>{children}</>
}
