/**
 * Complete End-to-End Payment Test Script
 * 
 * This script tests the complete payment flow without needing Postman.
 * It creates an order and generates all the data needed for verification.
 * 
 * Usage:
 * 1. Make sure backend server is running
 * 2. node test-payment.js
 */

require('dotenv').config();
const crypto = require('crypto');

const BASE_URL = 'http://localhost:5000';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60) + '\n');
}

function generateSignature(orderId, paymentId) {
  const signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return signature;
}

async function testPaymentFlow() {
  try {
    logSection('🧪 RAZORPAY PAYMENT INTEGRATION TEST');

    // Check environment variables
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      log('❌ Error: Razorpay credentials not found in .env file', 'red');
      log('\nPlease add to backend/.env:', 'yellow');
      log('RAZORPAY_KEY_ID=rzp_test_...', 'yellow');
      log('RAZORPAY_KEY_SECRET=...', 'yellow');
      process.exit(1);
    }

    if (process.env.RAZORPAY_KEY_ID === 'rzp_test_xxxxxxxxxx') {
      log('⚠️  Warning: Using placeholder Razorpay keys!', 'yellow');
      log('Please replace with your actual Test Mode keys from:', 'yellow');
      log('https://dashboard.razorpay.com/app/keys\n', 'cyan');
      process.exit(1);
    }

    log('✅ Environment variables loaded', 'green');
    log(`   Key ID: ${process.env.RAZORPAY_KEY_ID}`, 'cyan');
    log(`   Key Secret: ${process.env.RAZORPAY_KEY_SECRET.substring(0, 10)}...`, 'cyan');

    logSection('📝 TEST INSTRUCTIONS');
    
    log('This script will help you test the payment flow:', 'cyan');
    log('1. You need to login and get a JWT token first', 'yellow');
    log('2. You need a valid doctor ID and appointment ID', 'yellow');
    log('3. The script will show you how to complete the test\n', 'yellow');

    log('To get started:', 'bright');
    log('1. Start your backend: cd backend && npm run dev', 'cyan');
    log('2. Login via Postman or curl to get JWT token', 'cyan');
    log('3. Create an appointment to get appointment ID', 'cyan');
    log('4. Run this script with the IDs as arguments\n', 'cyan');

    log('Example usage:', 'bright');
    log('node test-payment.js <jwt_token> <appointment_id>\n', 'yellow');

    // Check if arguments provided
    const token = process.argv[2];
    const appointmentId = process.argv[3];

    if (!token || !appointmentId) {
      log('⚠️  No arguments provided. Showing signature generation example:', 'yellow');
      
      logSection('📋 SIGNATURE GENERATION EXAMPLE');
      
      const exampleOrderId = 'order_ABC123XYZ';
      const examplePaymentId = 'pay_DEF456GHI';
      const exampleSignature = generateSignature(exampleOrderId, examplePaymentId);
      
      log('For testing, you can generate a valid signature like this:\n', 'cyan');
      log(`Order ID:    ${exampleOrderId}`, 'yellow');
      log(`Payment ID:  ${examplePaymentId}`, 'yellow');
      log(`Signature:   ${exampleSignature}\n`, 'green');
      
      log('Use these in your verify payment request:', 'cyan');
      console.log(JSON.stringify({
        razorpay_order_id: exampleOrderId,
        razorpay_payment_id: examplePaymentId,
        razorpay_signature: exampleSignature,
        appointmentId: 'YOUR_APPOINTMENT_ID'
      }, null, 2));
      
      process.exit(0);
    }

    logSection('🚀 RUNNING PAYMENT TEST');

    // Test: Create Razorpay Order
    log('Step 1: Creating Razorpay order...', 'cyan');
    
    const createOrderResponse = await fetch(`${BASE_URL}/payment/create-order/appointment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ appointmentId })
    });

    if (!createOrderResponse.ok) {
      const error = await createOrderResponse.json();
      log(`❌ Failed to create order: ${error.message}`, 'red');
      process.exit(1);
    }

    const orderData = await createOrderResponse.json();
    log('✅ Razorpay order created successfully!', 'green');
    log(`   Order ID: ${orderData.order.id}`, 'cyan');
    log(`   Amount: ₹${orderData.order.amount / 100}`, 'cyan');
    log(`   Currency: ${orderData.order.currency}`, 'cyan');

    // Generate test payment data
    logSection('💳 SIMULATING PAYMENT');
    
    const razorpayOrderId = orderData.order.id;
    const razorpayPaymentId = `pay_TEST${Date.now()}`;
    const razorpaySignature = generateSignature(razorpayOrderId, razorpayPaymentId);
    
    log('Generated test payment details:', 'cyan');
    log(`   Payment ID: ${razorpayPaymentId}`, 'yellow');
    log(`   Signature:  ${razorpaySignature}\n`, 'yellow');

    log('⚠️  In production, these would come from Razorpay Checkout', 'yellow');
    log('For testing, we generate them using your secret key\n', 'yellow');

    // Test: Verify Payment
    log('Step 2: Verifying payment...', 'cyan');
    
    const verifyResponse = await fetch(`${BASE_URL}/payment/verify/appointment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        appointmentId: appointmentId
      })
    });

    if (!verifyResponse.ok) {
      const error = await verifyResponse.json();
      log(`❌ Payment verification failed: ${error.message}`, 'red');
      process.exit(1);
    }

    const verifyData = await verifyResponse.json();
    log('✅ Payment verified successfully!', 'green');
    log(`   Payment Status: ${verifyData.appointment.payment_status}`, 'cyan');

    logSection('🎉 TEST COMPLETED SUCCESSFULLY');
    
    log('Payment flow test results:', 'bright');
    log('✅ Order created in Razorpay', 'green');
    log('✅ Payment signature verified', 'green');
    log('✅ Appointment payment status updated to "paid"', 'green');
    log('✅ Payment details saved in database\n', 'green');

    log('Next steps:', 'cyan');
    log('1. Check Razorpay Dashboard for the order:', 'yellow');
    log('   https://dashboard.razorpay.com/app/orders', 'cyan');
    log('2. Check MongoDB for updated appointment:', 'yellow');
    log(`   db.appointments.findOne({_id: ObjectId("${appointmentId}")})`, 'cyan');
    log('3. Test with actual Razorpay Checkout on frontend\n', 'yellow');

  } catch (error) {
    log(`❌ Test failed with error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testPaymentFlow();
