import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { API_CONFIG } from '@/config/api.config'
import type { ErrorResponse } from '@/types/api.types'

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add auth token to headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(API_CONFIG.TOKEN_KEY)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    // Handle specific error codes
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem(API_CONFIG.TOKEN_KEY)
          if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
            window.location.href = '/login'
          }
          break
        case 403:
          console.error('Forbidden:', data.message)
          break
        case 404:
          console.error('Not found:', data.message)
          break
        case 500:
          console.error('Server error:', data.message)
          break
        default:
          console.error('API error:', data.message)
      }
    } else if (error.request) {
      // Network error
      console.error('Network error: Could not connect to server')
    }

    return Promise.reject(error)
  }
)

// Helper function to handle API errors
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>
    const message = axiosError.response?.data?.message || axiosError.message || 'An error occurred'
    const errorDetails = axiosError.response?.data?.error
    
    // Include error details if available
    if (errorDetails) {
      return `${message}: ${errorDetails}`
    }
    return message
  }
  return 'An unexpected error occurred'
}

// Auth helpers
export const setAuthToken = (token: string) => {
  localStorage.setItem(API_CONFIG.TOKEN_KEY, token)
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem(API_CONFIG.TOKEN_KEY)
}

export const removeAuthToken = () => {
  localStorage.removeItem(API_CONFIG.TOKEN_KEY)
}

export const isAuthenticated = (): boolean => {
  return !!getAuthToken()
}

export default apiClient
