// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  TIMEOUT: 10000,
  TOKEN_KEY: 'ayurveda_auth_token',
}

export const API_ENDPOINTS = {
  // Auth
  SIGNUP: '/signup',
  LOGIN: '/login',
  
  // Doctors
  DOCTORS: '/doctors',
  DOCTORS_SIGNUP: '/doctors/signup',
  DOCTORS_LOGIN: '/doctors/login',
  DOCTORS_STATS: '/doctors/stats/homepage',
  
  // Admin
  ADMIN_LOGIN: '/admin/login',
  
  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id: string) => `/products/${id}`,
  
  // Appointments
  APPOINTMENTS: '/appointments',
  APPOINTMENTS_DOCTOR: '/appointments/doctor',
  APPOINTMENTS_REQUEST: '/appointments/request',
  APPOINTMENT_BY_ID: (id: string) => `/appointments/${id}`,
  APPOINTMENT_CONFIRM: (id: string) => `/appointments/${id}/confirm`,
  
  // Cart
  CART: '/cart',
  CART_ADD: '/cart/add',
  CART_CHECKOUT: '/cart/checkout',
  
  // Orders
  ORDERS: '/orders',
  ORDER_BY_ID: (id: string) => `/orders/${id}`,
}
