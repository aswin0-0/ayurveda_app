// Razorpay utility functions for payment integration

// Extend Window interface to include Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, any>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

/**
 * Load Razorpay script dynamically (backup in case script tag fails)
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Initialize Razorpay checkout
 */
export const initializeRazorpay = async (options: RazorpayOptions): Promise<void> => {
  // Ensure Razorpay SDK is loaded
  const isLoaded = window.Razorpay || (await loadRazorpayScript());
  
  if (!isLoaded) {
    throw new Error('Failed to load Razorpay SDK');
  }

  // Create Razorpay instance and open checkout
  const razorpay = new window.Razorpay(options);
  razorpay.open();
};

/**
 * Create payment options for product order
 */
export const createProductPaymentOptions = (
  orderId: string,
  orderDetails: {
    razorpayOrderId: string;
    amount: number;
    currency: string;
    keyId: string;
  },
  userDetails: {
    name?: string;
    email?: string;
    phone?: string;
  },
  onSuccess: (response: RazorpayResponse) => void,
  onDismiss?: () => void
): RazorpayOptions => {
  return {
    key: orderDetails.keyId,
    amount: orderDetails.amount,
    currency: orderDetails.currency,
    name: 'Ayurvedic Wellness',
    description: 'Product Order Payment',
    order_id: orderDetails.razorpayOrderId,
    handler: onSuccess,
    prefill: {
      name: userDetails.name,
      email: userDetails.email,
      contact: userDetails.phone,
    },
    notes: {
      orderId: orderId,
      type: 'product',
    },
    theme: {
      color: '#10b981', // Green theme
    },
    modal: {
      ondismiss: onDismiss,
    },
  };
};

/**
 * Create payment options for appointment booking
 */
export const createAppointmentPaymentOptions = (
  appointmentId: string,
  orderDetails: {
    razorpayOrderId: string;
    amount: number;
    currency: string;
    keyId: string;
  },
  userDetails: {
    name?: string;
    email?: string;
    phone?: string;
  },
  doctorName: string,
  onSuccess: (response: RazorpayResponse) => void,
  onDismiss?: () => void
): RazorpayOptions => {
  return {
    key: orderDetails.keyId,
    amount: orderDetails.amount,
    currency: orderDetails.currency,
    name: 'Ayurvedic Wellness',
    description: `Appointment with Dr. ${doctorName}`,
    order_id: orderDetails.razorpayOrderId,
    handler: onSuccess,
    prefill: {
      name: userDetails.name,
      email: userDetails.email,
      contact: userDetails.phone,
    },
    notes: {
      appointmentId: appointmentId,
      type: 'appointment',
    },
    theme: {
      color: '#10b981',
    },
    modal: {
      ondismiss: onDismiss,
    },
  };
};

/**
 * Create payment options for tier upgrade
 */
export const createUpgradePaymentOptions = (
  orderDetails: {
    razorpayOrderId: string;
    amount: number;
    currency: string;
    keyId: string;
  },
  userDetails: {
    name?: string;
    email?: string;
    phone?: string;
  },
  onSuccess: (response: RazorpayResponse) => void,
  onDismiss?: () => void
): RazorpayOptions => {
  return {
    key: orderDetails.keyId,
    amount: orderDetails.amount,
    currency: orderDetails.currency,
    name: 'Ayurvedic Wellness',
    description: 'Pro Tier Upgrade',
    order_id: orderDetails.razorpayOrderId,
    handler: onSuccess,
    prefill: {
      name: userDetails.name,
      email: userDetails.email,
      contact: userDetails.phone,
    },
    notes: {
      type: 'tier_upgrade',
    },
    theme: {
      color: '#10b981',
    },
    modal: {
      ondismiss: onDismiss,
    },
  };
};
