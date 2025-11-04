const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Razorpay instance
// Make sure to add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file
const razorpayInstance = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET 
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

/**
 * Create a Razorpay order
 * @param {number} amount - Amount in smallest currency unit (paise for INR)
 * @param {string} currency - Currency code (default: INR)
 * @param {string} receipt - Unique receipt ID
 * @param {object} notes - Additional notes/metadata
 * @returns {Promise<object>} - Razorpay order object
 */
const createOrder = async (amount, currency = "INR", receipt, notes = {}) => {
  try {
    if (!razorpayInstance) {
      throw new Error("Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env");
    }
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt,
      notes,
    };
    const order = await razorpayInstance.orders.create(options);
    return order;
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw error;
  }
};

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} - True if signature is valid
 */
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.warn("Razorpay signature verification skipped - RAZORPAY_KEY_SECRET not configured");
      return false;
    }
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    return generatedSignature === signature;
  } catch (error) {
    console.error("Error verifying payment signature:", error);
    return false;
  }
};

/**
 * Fetch payment details from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<object>} - Payment details
 */
const fetchPayment = async (paymentId) => {
  try {
    if (!razorpayInstance) {
      throw new Error("Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env");
    }
    const payment = await razorpayInstance.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error("Error fetching payment:", error);
    throw error;
  }
};

module.exports = {
  razorpayInstance,
  createOrder,
  verifyPaymentSignature,
  fetchPayment,
};
