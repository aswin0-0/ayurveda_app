const express = require("express");
const User = require("../schema/User");
const Product = require("../schema/Product");
const Order = require("../schema/Order");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// add item to cart
router.post("/add", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;
    if (!productId) return res.status(400).json({ message: "productId required" });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.cart = user.cart || [];
    const existing = user.cart.find((c) => String(c.product) === String(productId));
    if (existing) {
      existing.quantity = (existing.quantity || 0) + (quantity || 1);
      // Remove item if quantity becomes 0 or less
      if (existing.quantity <= 0) {
        user.cart = user.cart.filter((c) => String(c.product) !== String(productId));
      }
    } else {
      // Only add if quantity is positive
      if ((quantity || 1) > 0) {
        user.cart.push({ product: productId, quantity: quantity || 1 });
      }
    }
    await user.save();
    const populated = await User.findById(userId).populate("cart.product");
    
    // Generate presigned URLs for Backblaze images
    const { getPresignedUrl } = require('../config/backblaze');
    const bucket = process.env.B2_BUCKET;
    
    const cart = populated.cart || [];
    const cartOut = [];
    
    for (const item of cart) {
      const cartItem = { ...item.toObject ? item.toObject() : item };
      const prod = cartItem.product;
      
      if (prod) {
        const prodObj = prod.toObject ? prod.toObject() : prod;
        
        // Process main image
        if (prodObj.image && /^https?:\/\//i.test(prodObj.image) && bucket && prodObj.image.includes(bucket)) {
          try {
            const parsed = new URL(prodObj.image);
            const key = parsed.pathname.replace(/^\//, '');
            const presigned = await getPresignedUrl(key, 300);
            prodObj.image = presigned;
          } catch (e) {
            console.warn('Could not create presigned url for main image', prodObj.image, e && e.message ? e.message : e);
          }
        }
        
        // Process images array
        if (prodObj.images && Array.isArray(prodObj.images)) {
          const presignedImages = [];
          for (const img of prodObj.images) {
            if (img && /^https?:\/\//i.test(img) && bucket && img.includes(bucket)) {
              try {
                const parsed = new URL(img);
                const key = parsed.pathname.replace(/^\//, '');
                const presigned = await getPresignedUrl(key, 300);
                presignedImages.push(presigned);
              } catch (e) {
                console.warn('Could not create presigned url for image', img, e && e.message ? e.message : e);
                presignedImages.push(img);
              }
            } else {
              presignedImages.push(img);
            }
          }
          prodObj.images = presignedImages;
        }
        
        cartItem.product = prodObj;
      }
      
      cartOut.push(cartItem);
    }
    
    res.json({ cart: cartOut });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// get current cart
router.get("/", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("cart.product");
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Generate presigned URLs for Backblaze images
    const { getPresignedUrl } = require('../config/backblaze');
    const bucket = process.env.B2_BUCKET;
    
    const cart = user.cart || [];
    const cartOut = [];
    
    for (const item of cart) {
      const cartItem = { ...item.toObject ? item.toObject() : item };
      const product = cartItem.product;
      
      if (product) {
        const prodObj = product.toObject ? product.toObject() : product;
        
        // Process main image
        if (prodObj.image && /^https?:\/\//i.test(prodObj.image) && bucket && prodObj.image.includes(bucket)) {
          try {
            const parsed = new URL(prodObj.image);
            const key = parsed.pathname.replace(/^\//, '');
            const presigned = await getPresignedUrl(key, 300);
            prodObj.image = presigned;
          } catch (e) {
            console.warn('Could not create presigned url for main image', prodObj.image, e && e.message ? e.message : e);
          }
        }
        
        // Process images array
        if (prodObj.images && Array.isArray(prodObj.images)) {
          const presignedImages = [];
          for (const img of prodObj.images) {
            if (img && /^https?:\/\//i.test(img) && bucket && img.includes(bucket)) {
              try {
                const parsed = new URL(img);
                const key = parsed.pathname.replace(/^\//, '');
                const presigned = await getPresignedUrl(key, 300);
                presignedImages.push(presigned);
              } catch (e) {
                console.warn('Could not create presigned url for image', img, e && e.message ? e.message : e);
                presignedImages.push(img);
              }
            } else {
              presignedImages.push(img);
            }
          }
          prodObj.images = presignedImages;
        }
        
        cartItem.product = prodObj;
      }
      
      cartOut.push(cartItem);
    }
    
    res.json({ cart: cartOut });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// checkout - requires address and phone; creates order with pending payment
router.post("/checkout", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("cart.product");
    if (!user) return res.status(404).json({ message: "User not found" });

    const address = req.body.address || user.address;
    const phone = req.body.phone || user.phone;
    if (!address || !phone)
      return res.status(400).json({ message: "Address and phone are required to place an order" });

    const cart = user.cart || [];
    if (!cart.length) return res.status(400).json({ message: "Cart is empty" });

    // build items and compute total
    let total = 0;
    const items = cart.map((c) => {
      const p = c.product;
      const qty = c.quantity || 1;
      const price = p.price || 0;
      total += price * qty;
      return { product: p._id, name: p.name, price, quantity: qty };
    });

    const order = new Order({ 
      user: user._id, 
      items, 
      address, 
      phone, 
      total,
      payment_status: "pending", // Payment is pending initially
    });
    await order.save();

    // attach order to user's history so it appears on their profile
    user.orders = user.orders || [];
    user.orders.push(order._id);

    // clear user's cart
    user.cart = [];
    // optionally update user's stored address/phone if provided in body
    if (req.body.address) user.address = req.body.address;
    if (req.body.phone) user.phone = req.body.phone;
    await user.save();

    // Return the order - frontend will initiate payment using the orderId
    res.json({ 
      order,
      message: "Order created. Please complete payment to confirm.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
