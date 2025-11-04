import apiClient, { handleApiError } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/config/api.config'
import type {
  Order,
  OrderResponse,
  OrdersResponse,
} from '@/types/api.types'

export const orderService = {
  /**
   * Get all orders for current user
   */
  getMyOrders: async (): Promise<Order[]> => {
    try {
      const response = await apiClient.get<OrdersResponse>(API_ENDPOINTS.ORDERS)
      return response.data.orders
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single order by ID
   */
  getOrderById: async (id: string): Promise<Order> => {
    try {
      const response = await apiClient.get<OrderResponse>(
        API_ENDPOINTS.ORDER_BY_ID(id)
      )
      return response.data.order
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
