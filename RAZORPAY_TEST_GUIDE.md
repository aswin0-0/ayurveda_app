# Quick Test Guide for Razorpay Integration

## Before Testing

### 1. Start the Backend Server
```bash
cd backend
npm run dev
```

### 2. Start the Frontend Server
```bash
cd frontend
npm run dev
```

### 3. Login/Register
- Go to http://localhost:3000 (or your frontend URL)
- Create an account or login

## Test Scenarios

### ✅ Test 1: Product Purchase with Razorpay

1. **Add Products to Cart**
   - Navigate to Products page
   - Add 2-3 products to cart
   - Check cart icon shows item count

2. **Checkout Process**
   - Click on cart icon or navigate to `/cart`
   - Verify total amount is displayed correctly
   - Click "Proceed to Checkout" button

3. **Razorpay Payment**
   - Razorpay checkout modal should open
   - You should see:
     - Order amount
     - "Ayurvedic Wellness" as merchant name
     - "Product Order Payment" as description
   
4. **Complete Payment** (Test Mode)
   - Use test card: `4111 1111 1111 1111`
   - CVV: `123`
   - Expiry: Any future date (e.g., 12/25)
   - Click "Pay Now"

5. **Verify Success**
   - Should see success message with Order ID
   - Cart should be empty
   - Should redirect to Orders page
   - Order should appear in dashboard

### ✅ Test 2: Appointment Booking with Razorpay

1. **Find a Doctor**
   - Navigate to Doctors page (`/doctors`)
   - Click on any doctor card

2. **Book Appointment**
   - Should see doctor details and consultation fee
   - Fill in the form:
     - Select date (today or future)
     - Choose mode (Online/Offline)
     - Add notes (optional)
   - Click "Pay ₹XXX & Book Appointment"

3. **Razorpay Payment**
   - Razorpay modal opens
   - Should show:
     - Consultation fee amount
     - Doctor name in description
     - "Appointment with Dr. [Name]"

4. **Complete Payment** (Test Mode)
   - Use same test card details
   - Click "Pay Now"

5. **Verify Success**
   - Success message should appear
   - Should redirect to `/dashboard/appointments`
   - Appointment should appear with "paid" status

### ✅ Test 3: Payment Cancellation

1. **Start Checkout**
   - Add items to cart OR try to book appointment
   - Click checkout/payment button

2. **Cancel Payment**
   - When Razorpay modal opens
   - Click the "X" or close button

3. **Verify Behavior**
   - Should show error message
   - For cart: Items remain in cart
   - For appointment: Appointment created but not confirmed
   - User can try payment again

## What to Check

### Frontend Console
- No JavaScript errors
- Razorpay script loaded successfully
- Payment flow logs (if any)

### Backend Logs
- Order/Appointment creation logs
- Razorpay order creation logs
- Payment verification logs
- No error messages

### Database
- Orders collection: Check payment_status field
- Appointments collection: Check payment_status field
- razorpay_order_id, razorpay_payment_id, razorpay_signature should be saved

## Common Issues & Solutions

### Issue: Razorpay Modal Doesn't Open
**Solutions:**
- Check browser console for errors
- Verify Razorpay script loaded (Network tab)
- Check if RAZORPAY_KEY_ID is correct in backend .env
- Try hard refresh (Ctrl+Shift+R)

### Issue: Payment Succeeds but Order Not Updated
**Solutions:**
- Check backend terminal for errors
- Verify RAZORPAY_KEY_SECRET in .env
- Check network tab for verify API call
- Look for signature verification errors in backend

### Issue: "Razorpay is not configured" Error
**Solutions:**
- Ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are in backend .env
- Restart backend server after adding env variables
- Check for typos in env variable names

### Issue: Payment Succeeds but Verification Fails
**Solutions:**
- Double-check RAZORPAY_KEY_SECRET is correct
- Ensure no extra spaces in env variables
- Check backend logs for specific error message
- Verify signature calculation in backend code

## Test Card Details (Razorpay Test Mode)

### Success Cards
- **Visa:** `4111 1111 1111 1111`
- **Mastercard:** `5555 5555 5555 4444`
- **Rupay:** `6522 2152 2222 2222`

### Failure Cards
- **Insufficient Funds:** `4000 0000 0000 0002`
- **Card Declined:** `4000 0000 0000 0069`

### For All Test Cards:
- CVV: Any 3 digits (e.g., 123)
- Expiry: Any future date
- Name: Any name
- OTP: 1234 (if prompted)

## Expected Results

### Successful Flow
1. ✅ Razorpay modal opens with correct details
2. ✅ Payment processes successfully
3. ✅ Payment verification succeeds on backend
4. ✅ Database updated with payment details
5. ✅ User sees success message
6. ✅ User redirected to appropriate page
7. ✅ Order/Appointment visible in dashboard

### Failed Flow
1. ✅ Error message shown to user
2. ✅ No payment deducted
3. ✅ Order/Appointment remains unpaid
4. ✅ User can retry payment

## Production Checklist

Before going live with real payments:

- [ ] Switch to Live Razorpay keys (rzp_live_...)
- [ ] Test with real small-amount transactions
- [ ] Enable HTTPS on your domain
- [ ] Set up webhooks for payment notifications
- [ ] Add proper error logging and monitoring
- [ ] Test on different browsers and devices
- [ ] Add rate limiting to prevent abuse
- [ ] Review Razorpay dashboard settings
- [ ] Set up payment notifications to customers
- [ ] Test refund flow (if applicable)

---

**Note:** Always test thoroughly in test mode before using live mode!
