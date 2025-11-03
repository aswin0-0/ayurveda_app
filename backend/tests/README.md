# Razorpay Payment Integration - Tests

This folder contains all testing resources for the Razorpay payment gateway integration.

## 📁 Files

| File | Purpose |
|------|---------|
| `TEST_RESULTS.md` | ✅ Test results and quick start guide |
| `TESTING_GUIDE.md` | Complete testing guide and instructions |
| `Razorpay_Postman_Collection.json` | Postman collection for API testing |
| `run-tests.js` | Automated test runner script |
| `README.md` | This file |

## 🚀 Quick Start

### 1. Run Automated Tests

```bash
cd backend/tests
node run-tests.js
```

This will:
- ✅ Check environment variables
- ✅ Test Razorpay configuration
- ✅ Verify signature generation
- ✅ Generate test payment data
- ✅ Display test cards and endpoints
- ✅ Check server connection

### 2. Manual Testing with Postman

1. **Import Collection:**
   - Open Postman
   - Click Import
   - Select `Razorpay_Postman_Collection.json`

2. **Configure:**
   - Set `base_url` to `http://localhost:5000`
   - Ensure backend server is running

3. **Test:**
   - Login first to get token
   - Follow test flows in order
   - Generate signatures using provided scripts

## 📖 Documentation

Read `TESTING_GUIDE.md` for:
- Detailed testing instructions
- Step-by-step flows
- Error handling
- Test credentials
- Troubleshooting

## 🧪 Test Flows

### 1. Appointment Payment
```
Login → Create Appointment → Create Order → Verify Payment
```

### 2. Product Payment
```
Login → Add to Cart → Checkout → Create Order → Verify Payment
```

### 3. Tier Upgrade
```
Login → Create Upgrade Order → Verify Payment
```

## 🔑 Test Credentials

### Test Cards (Success)
- **Mastercard:** 5267 3181 8797 5449
- **Visa:** 4386 2894 0766 0153
- **CVV:** Any 3 digits
- **Expiry:** Any future date

### Test UPI
- **Success:** success@razorpay
- **Failure:** failure@razorpay

## 🛠️ Generating Test Signatures

### Method 1: Use the automated script
```bash
cd backend
node generate-signature.js order_ABC123 pay_XYZ789
```

### Method 2: Use the test runner
```bash
cd backend/tests
node run-tests.js
```
(Will generate and display test signatures)

## ✅ Testing Checklist

- [ ] Environment variables configured
- [ ] Backend server running
- [ ] MongoDB connected
- [ ] Razorpay test keys added
- [ ] Postman collection imported
- [ ] Login successful
- [ ] Appointment payment flow tested
- [ ] Product payment flow tested
- [ ] Tier upgrade flow tested
- [ ] Error cases verified
- [ ] Dashboard payments checked

## 📊 Verify Results

### In Database (MongoDB)
```javascript
// Check appointment
db.appointments.findOne({_id: ObjectId("YOUR_ID")})
// Should show: payment_status: "paid"

// Check order
db.orders.findOne({_id: ObjectId("YOUR_ID")})
// Should show: payment_status: "paid"

// Check user
db.users.findOne({_id: ObjectId("YOUR_ID")})
// Should show: accountType: "pro" (after upgrade)
```

### On Razorpay Dashboard
1. Login to https://dashboard.razorpay.com
2. Switch to Test Mode
3. Go to Transactions → Payments
4. Verify payments show status "Captured"

## 🆘 Troubleshooting

### Tests Fail
- Check if backend server is running
- Verify `.env` has all required variables
- Ensure Razorpay keys are test mode keys
- Check MongoDB connection

### Signature Verification Fails
- Ensure using correct RAZORPAY_KEY_SECRET
- Order ID and Payment ID must match exactly
- Regenerate signature with correct values

### Server Not Responding
```bash
cd backend
npm run dev
```

## 📚 More Resources

- Main Backend Guide: `../RAZORPAY_BACKEND_README.md`
- Environment Template: `../.env.example`
- Signature Generator: `../generate-signature.js`

## 🎯 Test Results

After running `node run-tests.js`, you should see:

```
✅ All environment variables present
✅ Razorpay instance created successfully
✅ Signature generation working correctly
✅ Test payment data generated
✅ Server connection successful

Integration Status: ✅ READY FOR TESTING
```

## 🔄 Continuous Testing

Run tests regularly:
- After code changes
- Before commits
- Before deployment
- After updating Razorpay keys

---

**Happy Testing! 🎉**

For detailed instructions, see `TESTING_GUIDE.md`
