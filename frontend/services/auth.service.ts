import apiClient, { setAuthToken, removeAuthToken, handleApiError } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/config/api.config'
import type {
  SignupRequest,
  LoginRequest,
  AuthResponse,
  User,
} from '@/types/api.types'

export const authService = {
  /**
   * Register a new user
   */
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.SIGNUP, data)
      // Store token after successful signup
      setAuthToken(response.data.token)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Login user
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.LOGIN, data)
      // Store token after successful login
      setAuthToken(response.data.token)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    removeAuthToken()
    window.location.href = '/login'
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get<{ user: User }>('/auth/me')
      return response.data.user
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update current user profile
   */
  updateProfile: async (data: { name?: string; phone?: string; address?: string; password?: string }): Promise<User> => {
    try {
      const response = await apiClient.patch<{ user: User }>('/auth/me', data)
      return response.data.user
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
