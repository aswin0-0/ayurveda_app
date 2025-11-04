import apiClient, { handleApiError } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/config/api.config'
import type {
  Appointment,
  AppointmentRequest,
  AppointmentResponse,
  AppointmentsResponse,
} from '@/types/api.types'

export const appointmentService = {
  /**
   * Create a new appointment request
   */
  createAppointment: async (data: AppointmentRequest): Promise<Appointment> => {
    try {
      const response = await apiClient.post<AppointmentResponse>(
        API_ENDPOINTS.APPOINTMENTS_REQUEST,
        data
      )
      return response.data.appointment
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get all appointments for current user
   */
  getMyAppointments: async (): Promise<Appointment[]> => {
    try {
      const response = await apiClient.get<AppointmentsResponse>(
        API_ENDPOINTS.APPOINTMENTS
      )
      return response.data.appointments
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single appointment by ID
   */
  getAppointmentById: async (id: string): Promise<Appointment> => {
    try {
      const response = await apiClient.get<AppointmentResponse>(
        API_ENDPOINTS.APPOINTMENT_BY_ID(id)
      )
      return response.data.appointment
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get all appointments for current doctor
   */
  getDoctorAppointments: async (): Promise<Appointment[]> => {
    try {
      const response = await apiClient.get<AppointmentsResponse>(
        API_ENDPOINTS.APPOINTMENTS_DOCTOR
      )
      return response.data.appointments
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Confirm appointment (for doctors)
   */
  confirmAppointment: async (id: string): Promise<Appointment> => {
    try {
      const response = await apiClient.post<AppointmentResponse>(
        API_ENDPOINTS.APPOINTMENT_CONFIRM(id)
      )
      return response.data.appointment
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
