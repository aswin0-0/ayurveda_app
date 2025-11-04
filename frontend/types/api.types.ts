// TypeScript interfaces matching backend schemas

export interface User {
  id: string
  name: string
  email: string
  role?: 'patient'
  accountType?: 'free' | 'pro'
  phone?: string
  address?: string
  cart?: CartItem[]
  records?: string[]
  orders?: string[]
}

export interface Doctor {
  _id: string
  id?: string
  name: string
  email: string
  role?: 'doctor'
  speciality?: string
  clinicAddress?: string
  fee?: number
  uniqueId?: string
  availability?: Availability[]
  phone?: string
  createdAt?: string
  updatedAt?: string
}

export interface Availability {
  day: string
  from: string
  to: string
}

export interface Product {
  _id: string
  id?: string
  name: string
  description?: string
  price: number
  image?: string
  metadata?: Record<string, any>
  createdAt?: string
  updatedAt?: string
}

export interface CartItem {
  product: Product | string
  quantity: number
}

export interface Appointment {
  _id: string
  id?: string
  patient: User | string
  doctor: Doctor | string
  date: string
  mode?: 'online' | 'offline'
  fee?: number
  notes?: string
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  createdAt?: string
  updatedAt?: string
}

export interface Order {
  _id: string
  id?: string
  user: User | string
  items: OrderItem[]
  address: string
  phone: string
  total: number
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt?: string
  updatedAt?: string
}

export interface OrderItem {
  product: string
  name: string
  price: number
  quantity: number
}

// API Response types
export interface AuthResponse {
  token: string
  user: User
}

export interface DoctorResponse {
  doctor: Doctor
}

export interface DoctorsListResponse {
  doctors: Doctor[]
}

export interface ProductsResponse {
  products: Product[]
  page: number
  limit: number
  total: number
  pages: number
}

export interface ProductResponse {
  product: Product
}

export interface AppointmentResponse {
  appointment: Appointment
}

export interface AppointmentsResponse {
  appointments: Appointment[]
}

export interface CartResponse {
  cart: CartItem[]
}

export interface OrderResponse {
  order: Order
}

export interface OrdersResponse {
  orders: Order[]
}

export interface ErrorResponse {
  message: string
  error?: string
}

// Request types
export interface SignupRequest {
  name: string
  email: string
  password: string
  accountType?: 'free' | 'pro'
}

export interface LoginRequest {
  email: string
  password: string
}

export interface DoctorSignupRequest {
  name: string
  email: string
  password: string
  speciality?: string
  clinicAddress?: string
  fee?: number
  uniqueId?: string
  phone?: string
}

export interface AppointmentRequest {
  doctorId: string
  date: string
  mode?: 'online' | 'offline'
  notes?: string
}

export interface AddToCartRequest {
  productId: string
  quantity?: number
}

export interface CheckoutRequest {
  address?: string
  phone?: string
}
