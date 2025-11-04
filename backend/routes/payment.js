const express = require("express");
const {
  createOrder,
  verifyPaymentSignature,
  fetchPayment,
} = require("../config/razorpay");
const Appointment = require("../schema/Appointment");
const Order = require("../schema/Order");
const User = require("../schema/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Create Razorpay order for appointment booking
router.post("/create-order/appointment", requireAuth, async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ message: "Appointment ID is required" });
    }

    const appointment = await Appointment.findById(appointmentId).populate(
      "doctor",
      "name"
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Verify the appointment belongs to the requesting user
    if (String(appointment.patient) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if payment is already done
    if (appointment.payment_status === "paid") {
      return res.status(400).json({ message: "Payment already completed" });
    }

    const amount = appointment.fee;
    if (amount <= 0) {
      return res
        .status(400)
        .json({ message: "Invalid appointment fee amount" });
    }

    // Create Razorpay order
    const receipt = `appt_${appointmentId}_${Date.now()}`;
    const notes = {
      appointmentId: String(appointmentId),
      patientId: String(appointment.patient),
      doctorId: String(appointment.doctor._id),
      type: "appointment",
    };

    const razorpayOrder = await createOrder(amount, "INR", receipt, notes);

    // Update appointment with razorpay_order_id
    appointment.razorpay_order_id = razorpayOrder.id;
    await appointment.save();

    res.json({
      success: true,
      order: razorpayOrder,
      key_id: process.env.RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      appointmentId: appointmentId,
    });
  } catch (error) {
    console.error("Error creating Razorpay order for appointment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create Razorpay order for product order
router.post("/create-order/product", requireAuth, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify the order belongs to the requesting user
    if (String(order.user) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if payment is already done
    if (order.payment_status === "paid") {
      return res.status(400).json({ message: "Payment already completed" });
    }

    const amount = order.total;
    if (amount <= 0) {
      return res.status(400).json({ message: "Invalid order amount" });
    }

    // Create Razorpay order
    const receipt = `order_${orderId}_${Date.now()}`;
    const notes = {
      orderId: String(orderId),
      userId: String(order.user),
      type: "product",
    };

    const razorpayOrder = await createOrder(amount, "INR", receipt, notes);

    // Update order with razorpay_order_id
    order.razorpay_order_id = razorpayOrder.id;
    await order.save();

    res.json({
      success: true,
      order: razorpayOrder,
      key_id: process.env.RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderId: orderId,
    });
  } catch (error) {
    console.error("Error creating Razorpay order for product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create Razorpay order for tier upgrade
router.post("/create-order/upgrade", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already pro
    if (user.accountType === "pro") {
      return res.status(400).json({ message: "Already a Pro user" });
    }

    // Define pro tier pricing (you can modify this)
    const PRO_TIER_PRICE = 999; // ₹999 for example

    // Create Razorpay order
    const receipt = `upgrade_${user._id}_${Date.now()}`;
    const notes = {
      userId: String(user._id),
      type: "tier_upgrade",
      from: "free",
      to: "pro",
    };

    const razorpayOrder = await createOrder(
      PRO_TIER_PRICE,
      "INR",
      receipt,
      notes
    );

    res.json({
      success: true,
      order: razorpayOrder,
      key_id: process.env.RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      userId: user._id,
    });
  } catch (error) {
    console.error("Error creating Razorpay order for upgrade:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Verify payment for appointment
router.post("/verify/appointment", requireAuth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      appointmentId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !appointmentId
    ) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    // Verify signature
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Update appointment with payment details
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Verify the appointment belongs to the requesting user
    if (String(appointment.patient) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    appointment.razorpay_payment_id = razorpay_payment_id;
    appointment.razorpay_signature = razorpay_signature;
    appointment.payment_status = "paid";
    await appointment.save();

    res.json({
      success: true,
      message: "Payment verified successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error verifying appointment payment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Verify payment for product order
router.post("/verify/product", requireAuth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    // Verify signature
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Update order with payment details
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify the order belongs to the requesting user
    if (String(order.user) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    order.razorpay_payment_id = razorpay_payment_id;
    order.razorpay_signature = razorpay_signature;
    order.payment_status = "paid";
    await order.save();

    res.json({
      success: true,
      message: "Payment verified successfully",
      order,
    });
  } catch (error) {
    console.error("Error verifying product payment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Verify payment for tier upgrade
router.post("/verify/upgrade", requireAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    // Verify signature
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Update user account type to pro
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.accountType = "pro";
    await user.save();

    res.json({
      success: true,
      message: "Account upgraded to Pro successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountType: user.accountType,
      },
    });
  } catch (error) {
    console.error("Error verifying upgrade payment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Handle payment failure
router.post("/payment-failed", requireAuth, async (req, res) => {
  try {
    const { orderId, appointmentId, error } = req.body;

    // Log the failure (you can also update the database if needed)
    console.error("Payment failed:", {
      orderId,
      appointmentId,
      error,
      userId: req.user.id,
    });

    // Update payment status to failed if orderId or appointmentId is provided
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (
        appointment &&
        String(appointment.patient) === String(req.user.id)
      ) {
        appointment.payment_status = "failed";
        await appointment.save();
      }
    }

    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && String(order.user) === String(req.user.id)) {
        order.payment_status = "failed";
        await order.save();
      }
    }

    res.json({
      success: true,
      message: "Payment failure recorded",
    });
  } catch (error) {
    console.error("Error handling payment failure:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get Razorpay key (for frontend)
router.get("/get-key", (req, res) => {
  res.json({
    key_id: process.env.RAZORPAY_KEY_ID,
  });
});

module.exports = router;
