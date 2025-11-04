import React, { createContext, useContext, useState, useEffect } from 'react'
import { API_CONFIG } from '../config/api.config'
import { authService } from '../services/auth.service'
import type { User } from '../types/api.types'

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
      
      if (token) {
        try {
          // Try to fetch current user
          const userData = await authService.getCurrentUser()
          setUser(userData)
          setUserType(storedUserType || 'patient')
        } catch (error) {
          // Token is invalid or expired
          console.error('Auth check failed:', error)
          localStorage.removeItem(API_CONFIG.TOKEN_KEY)
          localStorage.removeItem('user_type')
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
    }
  }

  const logout = () => {
    localStorage.removeItem(API_CONFIG.TOKEN_KEY)
    localStorage.removeItem('user_type')
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
    isAuthenticated: !!user,
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
