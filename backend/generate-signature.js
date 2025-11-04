/**
 * Razorpay Signature Generator for Testing
 * 
 * This script helps you generate a valid Razorpay signature for testing
 * payment verification without actually making a payment.
 * 
 * Usage:
 * node generate-signature.js <order_id> <payment_id>
 * 
 * Example:
 * node generate-signature.js order_ABC123 pay_XYZ789
 */

require('dotenv').config();
const crypto = require('crypto');

// Get command line arguments
const orderId = process.argv[2];
const paymentId = process.argv[3];

if (!orderId || !paymentId) {
  console.error('\n❌ Error: Missing required arguments\n');
  console.log('Usage: node generate-signature.js <order_id> <payment_id>\n');
  console.log('Example:');
  console.log('  node generate-signature.js order_ABC123 pay_XYZ789\n');
  process.exit(1);
}

if (!process.env.RAZORPAY_KEY_SECRET) {
  console.error('\n❌ Error: RAZORPAY_KEY_SECRET not found in .env file\n');
  console.log('Please add your Razorpay secret key to backend/.env:');
  console.log('RAZORPAY_KEY_SECRET=your_secret_key_here\n');
  process.exit(1);
}

// Generate signature
const signature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(`${orderId}|${paymentId}`)
  .digest('hex');

console.log('\n✅ Razorpay Signature Generated Successfully!\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('Order ID:         ', orderId);
console.log('Payment ID:       ', paymentId);
console.log('Generated Signature:', signature);
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('Use this in your API request:\n');
console.log(JSON.stringify({
  razorpay_order_id: orderId,
  razorpay_payment_id: paymentId,
  razorpay_signature: signature
}, null, 2));
console.log('\n');

// Verify the signature (to ensure it's correct)
const generatedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(`${orderId}|${paymentId}`)
  .digest('hex');

const isValid = generatedSignature === signature;
console.log('✓ Signature is valid:', isValid);
console.log('');
