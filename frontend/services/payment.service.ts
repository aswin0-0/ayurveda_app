// Payment service for Razorpay integration
import apiClient from '../lib/api-client';

export interface CreateOrderResponse {
  success: boolean;
  order: {
    id: string;
    amount: number;
    currency: string;
  };
  key_id: string;
  amount: number;
  currency: string;
  appointmentId?: string;
  orderId?: string;
  userId?: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  appointmentId?: string;
  orderId?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  appointment?: any;
  order?: any;
  user?: any;
}

export const paymentService = {
  // Create Razorpay order for appointment
  createAppointmentOrder: async (appointmentId: string): Promise<CreateOrderResponse> => {
    const response = await apiClient.post('/payment/create-order/appointment', {
      appointmentId,
    });
    return response.data;
  },

  // Create Razorpay order for product order
  createProductOrder: async (orderId: string): Promise<CreateOrderResponse> => {
    const response = await apiClient.post('/payment/create-order/product', {
      orderId,
    });
    return response.data;
  },

  // Create Razorpay order for tier upgrade
  createUpgradeOrder: async (): Promise<CreateOrderResponse> => {
    const response = await apiClient.post('/payment/create-order/upgrade');
    return response.data;
  },

  // Verify appointment payment
  verifyAppointmentPayment: async (
    paymentData: VerifyPaymentRequest
  ): Promise<VerifyPaymentResponse> => {
    const response = await apiClient.post('/payment/verify/appointment', paymentData);
    return response.data;
  },

  // Verify product order payment
  verifyProductPayment: async (
    paymentData: VerifyPaymentRequest
  ): Promise<VerifyPaymentResponse> => {
    const response = await apiClient.post('/payment/verify/product', paymentData);
    return response.data;
  },

  // Verify tier upgrade payment
  verifyUpgradePayment: async (
    paymentData: Omit<VerifyPaymentRequest, 'appointmentId' | 'orderId'>
  ): Promise<VerifyPaymentResponse> => {
    const response = await apiClient.post('/payment/verify/upgrade', paymentData);
    return response.data;
  },
};
