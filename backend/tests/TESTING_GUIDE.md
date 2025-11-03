# Razorpay Payment Integration - Testing Guide

## 🚀 Quick Start

### Step 1: Add Your Razorpay Test API Keys

1. Login to https://dashboard.razorpay.com
2. Switch to **Test Mode** (toggle on top-left)
3. Go to **Settings → API Keys → Generate Key**
4. Copy your Test API keys
5. Add to `/backend/.env`:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_test_secret_key_here
```

### Step 2: Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
Connected to MongoDB
Server running on port 5000
```

### Step 3: Run Tests

```bash
cd backend/tests
node run-tests.js
```

---

## 🧪 Manual Testing with Postman

### Import Collection
1. Open Postman
2. Click **Import**
3. Select `backend/tests/Razorpay_Postman_Collection.json`
4. Collection will be imported with all endpoints

### Configure Variables
1. Click on the collection
2. Go to **Variables** tab
3. Set:
   - `base_url` = `http://localhost:5000`
   - Save

### Test Flow

#### 1. Login First
- Run `Auth → Login`
- Token will be auto-saved to collection variables

#### 2. Test Appointment Payment
- Run requests in order:
  1. `Appointment Payment Flow → 1. Create Appointment`
  2. `Appointment Payment Flow → 2. Create Razorpay Order`
  3. Manually add payment details (see below)
  4. `Appointment Payment Flow → 3. Verify Payment`
  5. `Appointment Payment Flow → 4. Get Appointment Details`

#### 3. Test Product Payment
- Run requests in order:
  1. `Product Payment Flow → 1. Add to Cart`
  2. `Product Payment Flow → 2. Checkout Cart`
  3. `Product Payment Flow → 3. Create Razorpay Order`
  4. Manually add payment details
  5. `Product Payment Flow → 4. Verify Payment`

#### 4. Test Tier Upgrade
- Run requests in order:
  1. `Tier Upgrade Flow → 1. Create Razorpay Order`
  2. Manually add payment details
  3. `Tier Upgrade Flow → 2. Verify Payment`

---

## 🔐 Generating Test Payment Details

### Option 1: Using Test Script
```bash
cd backend/tests
node test-payment-flow.js
```

This will:
- Create a test order
- Generate valid payment_id and signature
- Show you the exact JSON to use in verification

### Option 2: Using Signature Generator
```bash
cd backend
node generate-signature.js order_RAZORPAY_ORDER_ID pay_FAKE_PAYMENT_ID
```

### Option 3: Manual Calculation
Use this Node.js code:
```javascript
const crypto = require('crypto');
const orderId = 'order_YOUR_ORDER_ID';
const paymentId = 'pay_' + Date.now(); // Fake payment ID
const secret = 'YOUR_RAZORPAY_SECRET';

const signature = crypto
  .createHmac('sha256', secret)
  .update(`${orderId}|${paymentId}`)
  .digest('hex');

console.log({
  razorpay_order_id: orderId,
  razorpay_payment_id: paymentId,
  razorpay_signature: signature
});
```

---

## 🧾 Test Card Details (Razorpay Test Mode)

### Domestic Cards
| Card Network | Card Number | Result |
|--------------|-------------|--------|
| Mastercard | 5267 3181 8797 5449 | Success |
| Visa | 4386 2894 0766 0153 | Success |

### International Cards
| Card Network | Card Number | Result |
|--------------|-------------|--------|
| Mastercard | 5555 5555 5555 4444 | Success |
| Visa | 4012 8888 8888 1881 | Success |

**Additional Details:**
- **CVV:** Any 3 digits (e.g., 123)
- **Expiry:** Any future date (e.g., 12/25)
- **Cardholder Name:** Any name

### UPI IDs
- **Success:** `success@razorpay`
- **Failure:** `failure@razorpay`

### Netbanking
- Select any bank
- You'll see a mock page
- Click "Success" or "Failure"

---

## ✅ Testing Checklist

### Prerequisites
- [ ] Razorpay account created
- [ ] Test API keys obtained
- [ ] Keys added to `.env`
- [ ] Backend server running
- [ ] MongoDB connected

### Appointment Payment
- [ ] Create appointment successfully
- [ ] Appointment has `payment_status: "pending"`
- [ ] Create Razorpay order successfully
- [ ] `razorpay_order_id` saved in appointment
- [ ] Generate valid payment signature
- [ ] Verify payment successfully
- [ ] `payment_status` changed to "paid"
- [ ] Payment details saved in appointment

### Product Payment
- [ ] Add products to cart
- [ ] Checkout creates order
- [ ] Order has `payment_status: "pending"`
- [ ] Create Razorpay order successfully
- [ ] `razorpay_order_id` saved in order
- [ ] Verify payment successfully
- [ ] `payment_status` changed to "paid"
- [ ] Cart cleared after checkout

### Tier Upgrade
- [ ] User is initially "free"
- [ ] Create upgrade order (₹999)
- [ ] Verify payment successfully
- [ ] User upgraded to "pro"

### Error Handling
- [ ] Invalid appointment/order ID rejected
- [ ] Unauthorized access blocked
- [ ] Invalid signature rejected
- [ ] Double payment prevented
- [ ] Payment failure recorded

---

## 🔍 Verify in Database

After successful payment, check MongoDB:

```javascript
// Check appointment
db.appointments.findOne({_id: ObjectId("YOUR_APPOINTMENT_ID")})

// Should show:
{
  payment_status: "paid",
  razorpay_order_id: "order_xxx",
  razorpay_payment_id: "pay_xxx",
  razorpay_signature: "xxx..."
}

// Check order
db.orders.findOne({_id: ObjectId("YOUR_ORDER_ID")})

// Check user tier
db.users.findOne({_id: ObjectId("YOUR_USER_ID")})
// Should show: accountType: "pro"
```

---

## 🎯 Expected API Responses

### Create Order Response:
```json
{
  "success": true,
  "order": {
    "id": "order_xxx",
    "amount": 50000,
    "currency": "INR",
    "status": "created"
  },
  "key_id": "rzp_test_xxx"
}
```

### Verify Payment Response:
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "appointment": {
    "_id": "xxx",
    "payment_status": "paid",
    "razorpay_payment_id": "pay_xxx",
    "razorpay_signature": "xxx"
  }
}
```

---

## ❌ Common Errors & Solutions

### Error: "RAZORPAY_KEY_ID is not defined"
**Solution:** Add Razorpay keys to `.env` and restart server

### Error: "Invalid payment signature"
**Solution:** 
- Check if secret key is correct
- Ensure order_id and payment_id match
- Regenerate signature using correct values

### Error: "Appointment not found"
**Solution:** 
- Check if appointment ID is correct
- Ensure appointment was created successfully

### Error: "Not authorized"
**Solution:**
- Check if you're logged in
- Ensure JWT token is valid
- Verify the resource belongs to logged-in user

### Error: "Payment already completed"
**Solution:**
- This appointment/order has already been paid
- Create a new appointment/order for testing

---

## 📊 Monitoring on Razorpay Dashboard

1. Login to https://dashboard.razorpay.com
2. Ensure you're in **Test Mode**
3. Go to **Transactions → Payments**
4. Check recent test payments
5. Status should show **"Captured"** for successful payments

---

## 🔄 Test Automation

Run automated tests:

```bash
cd backend/tests
node run-tests.js
```

This will:
1. Test all API endpoints
2. Verify signature generation
3. Check error handling
4. Print detailed results

---

## 📝 Sample Test Data

### Test User
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### Test Doctor (Create via admin)
```json
{
  "name": "Dr. Test Kumar",
  "speciality": "General Physician",
  "fee": 500
}
```

### Test Product (Create via admin)
```json
{
  "name": "Ayurvedic Oil",
  "price": 299,
  "description": "Test product"
}
```

---

## 🚦 Ready for Production?

Before switching to Live Mode:

- [ ] All test cases pass
- [ ] Error handling verified
- [ ] Database updates correct
- [ ] Payment signatures valid
- [ ] Dashboard shows test payments
- [ ] Frontend integration complete (when ready)
- [ ] KYC completed on Razorpay
- [ ] Settlement account configured
- [ ] Live API keys generated
- [ ] Test keys replaced with live keys

---

## 📞 Support

- **Razorpay Docs:** https://razorpay.com/docs/
- **Test Cards:** https://razorpay.com/docs/payments/test-card-details/
- **Dashboard:** https://dashboard.razorpay.com/
- **Support:** https://razorpay.com/support/

---

**Happy Testing! 🎉**
