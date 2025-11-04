import apiClient, { handleApiError } from '../lib/api-client'
import { API_ENDPOINTS } from '../config/api.config'

export interface AdminLoginRequest {
  email: string
  password: string
}

export interface AdminLoginResponse {
  token: string
  admin: {
    email: string
  }
}

export const adminService = {
  /**
   * Admin login
   */
  login: async (data: AdminLoginRequest): Promise<AdminLoginResponse> => {
    try {
      const response = await apiClient.post<AdminLoginResponse>(API_ENDPOINTS.ADMIN_LOGIN, data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
