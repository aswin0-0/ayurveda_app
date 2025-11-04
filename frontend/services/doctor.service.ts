import apiClient, { handleApiError } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/config/api.config'
import type {
  Doctor,
  DoctorsListResponse,
  DoctorSignupRequest,
  LoginRequest,
  AuthResponse,
} from '@/types/api.types'

export const doctorService = {
  /**
   * Get all doctors
   */
  getAllDoctors: async (): Promise<Doctor[]> => {
    try {
      const response = await apiClient.get<DoctorsListResponse>(API_ENDPOINTS.DOCTORS)
      return response.data.doctors
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Register a new doctor
   */
  signup: async (data: DoctorSignupRequest): Promise<{ doctor: Doctor }> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.DOCTORS_SIGNUP, data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Doctor login
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.DOCTORS_LOGIN, data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
