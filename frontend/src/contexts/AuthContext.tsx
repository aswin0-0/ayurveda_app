import React, { createContext, useContext, useState, useEffect } from 'react'
import { API_CONFIG } from '@/config/api.config'
import { authService } from '@/services/auth.service'
import type { User } from '@/types/api.types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  userType: 'patient' | 'doctor' | 'admin' | null
  isLoading: boolean
  login: (token: string, userType: 'patient' | 'doctor' | 'admin', userData?: User) => void
  logout: () => void
  updateUser: (userData: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userType, setUserType] = useState<'patient' | 'doctor' | 'admin' | null>(null)

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(API_CONFIG.TOKEN_KEY)
      const storedUserType = localStorage.getItem('user_type') as 'patient' | 'doctor' | 'admin' | null
      
      if (token && storedUserType) {
        try {
          if (storedUserType === 'patient') {
            // Try to fetch current user for patients
            const userData = await authService.getCurrentUser()
            setUser(userData)
            setUserType('patient')
          } else {
            // For admin/doctor, just set the userType
            setUserType(storedUserType)
            // Set a minimal user object
            setUser({
              id: token.substring(0, 10),
              name: storedUserType.charAt(0).toUpperCase() + storedUserType.slice(1),
              email: localStorage.getItem('temp_email') || '',
              phone: '',
            } as any)
          }
        } catch (error) {
          // Token is invalid or expired
          console.error('Auth check failed:', error)
          localStorage.removeItem(API_CONFIG.TOKEN_KEY)
          localStorage.removeItem('user_type')
          localStorage.removeItem('temp_email')
          setUser(null)
          setUserType(null)
        }
      }
      
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = (token: string, type: 'patient' | 'doctor' | 'admin', userData?: User) => {
    localStorage.setItem(API_CONFIG.TOKEN_KEY, token)
    localStorage.setItem('user_type', type)
    setUserType(type)
    if (userData) {
      setUser(userData)
    } else if (type === 'admin' || type === 'doctor') {
      // For admin/doctor, create a minimal user object so isAuthenticated becomes true
      setUser({
        id: token.substring(0, 10), // Use part of token as temp ID
        name: type.charAt(0).toUpperCase() + type.slice(1),
        email: localStorage.getItem('temp_email') || '',
        phone: '',
      } as any) // Use any to bypass type checking for admin/doctor
    }
  }

  const logout = () => {
    localStorage.removeItem(API_CONFIG.TOKEN_KEY)
    localStorage.removeItem('user_type')
    localStorage.removeItem('temp_email')
    setUser(null)
    setUserType(null)
    // Redirect to home
    window.location.href = '/'
  }

  const updateUser = (userData: User) => {
    setUser(userData)
  }

  const value = {
    user,
    isAuthenticated: !!(user || userType), // Consider authenticated if we have user OR userType
    userType,
    isLoading,
    login,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
