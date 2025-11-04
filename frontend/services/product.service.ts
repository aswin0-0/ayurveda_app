import apiClient, { handleApiError } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/config/api.config'
import type {
  Product,
  ProductsResponse,
  ProductResponse,
} from '@/types/api.types'

export interface ProductsQuery {
  page?: number
  limit?: number
  q?: string
}

export const productService = {
  /**
   * Get all products with pagination and search
   */
  getProducts: async (query: ProductsQuery = {}): Promise<ProductsResponse> => {
    try {
      const params = new URLSearchParams()
      if (query.page) params.append('page', query.page.toString())
      if (query.limit) params.append('limit', query.limit.toString())
      if (query.q) params.append('q', query.q)

      const response = await apiClient.get<ProductsResponse>(
        `${API_ENDPOINTS.PRODUCTS}?${params.toString()}`
      )
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single product by ID
   */
  getProductById: async (id: string): Promise<Product> => {
    try {
      const response = await apiClient.get<ProductResponse>(
        API_ENDPOINTS.PRODUCT_BY_ID(id)
      )
      return response.data.product
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
