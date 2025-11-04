import apiClient, { handleApiError } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/config/api.config'
import type {
  CartItem,
  CartResponse,
  AddToCartRequest,
  CheckoutRequest,
  Order,
  OrderResponse,
} from '@/types/api.types'

export const cartService = {
  /**
   * Add item to cart
   */
  addToCart: async (data: AddToCartRequest): Promise<CartItem[]> => {
    try {
      const response = await apiClient.post<CartResponse>(
        API_ENDPOINTS.CART_ADD,
        data
      )
      return response.data.cart
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get current cart
   */
  getCart: async (): Promise<CartItem[]> => {
    try {
      const response = await apiClient.get<CartResponse>(API_ENDPOINTS.CART)
      return response.data.cart
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Checkout cart
   */
  checkout: async (data: CheckoutRequest): Promise<Order> => {
    try {
      const response = await apiClient.post<OrderResponse>(
        API_ENDPOINTS.CART_CHECKOUT,
        data
      )
      return response.data.order
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
