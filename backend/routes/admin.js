const express = require("express");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { uploadBuffer } = require("../config/backblaze");
const Product = require("../schema/Product");
const User = require("../schema/User");
const Doctor = require("../schema/Doctor");
const Appointment = require("../schema/Appointment");
const Order = require("../schema/Order");
const { requireAdmin } = require("../middleware/adminAuth");

// ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const safe = Date.now() + "-" + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    cb(null, safe);
  },
});
const upload = multer({ storage });

const router = express.Router();

// admin login - reads ADMIN_CREDENTIALS env var as JSON array
router.post("/login", (req, res) => {
  const adminsRaw = process.env.ADMIN_CREDENTIALS || "[]";
  let admins = [];
  try {
    admins = JSON.parse(adminsRaw);
  } catch (e) {
    admins = [];
  }
  const { email, password } = req.body;
  // normalize parsed admin objects and incoming values to avoid failures due to
  // stray whitespace or formatting differences in .env files.
  const normAdmins = admins.map((a) => ({
    email: a && a.email ? String(a.email).trim() : "",
    password: a && a.password ? String(a.password) : "",
  }));
  const inEmail = email ? String(email).trim() : "";
  const inPass = password ? String(password) : "";

  const found = normAdmins.find((a) => a.email === inEmail && a.password === inPass);
  if (!found) return res.status(401).json({ message: "Invalid admin credentials" });
  const token = jwt.sign({ email: found.email, admin: true }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.json({ token, admin: { email: found.email } });
});

// Get admin dashboard statistics
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const totalProducts = await Product.countDocuments();
    
    // Get total orders and revenue
    const orders = await Order.find();
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Get recent appointments (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentAppointments = await Appointment.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Calculate percentage changes (simplified - comparing with previous period)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const previousPeriodAppointments = await Appointment.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });
    
    const appointmentChange = previousPeriodAppointments > 0 
      ? Math.round(((recentAppointments - previousPeriodAppointments) / previousPeriodAppointments) * 100)
      : 0;
    
    // Get recent activity
    const recentActivities = [];
    
    // Recent users
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(2).select('name createdAt');
    recentUsers.forEach(user => {
      recentActivities.push({
        action: "New user registered",
        user: user.name,
        time: user.createdAt
      });
    });
    
    // Recent appointments
    const recentAppts = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .populate('doctor', 'name')
      .populate('patient', 'name');
    recentAppts.forEach(appt => {
      recentActivities.push({
        action: "New appointment booked",
        user: appt.doctor?.name || "Unknown Doctor",
        time: appt.createdAt
      });
    });
    
    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .populate('user', 'name');
    recentOrders.forEach(order => {
      recentActivities.push({
        action: "Product order placed",
        user: order.user?.name || "Unknown User",
        time: order.createdAt
      });
    });
    
    // Sort all activities by time
    recentActivities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    res.json({
      stats: {
        totalUsers,
        totalDoctors,
        totalAppointments,
        totalProducts,
        totalOrders,
        totalRevenue,
        appointmentChange
      },
      recentActivities: recentActivities.slice(0, 5)
    });
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// create a product (admin only)
// create a product (admin only). Accepts multipart/form-data with optional `image` file.
router.post("/products", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const { 
      name, 
      price, 
      description, 
      longDescription,
      category,
      stock,
      usage,
      benefits,
      ingredients,
      tags,
      metadata 
    } = req.body;
    
    if (!name || price == null) return res.status(400).json({ message: "Missing fields" });
    
    let image = req.body.image;
    const images = [];

    // Handle main image
    if (req.file) {
      try {
        console.log(`[ADMIN] Processing product image upload: ${req.file.path}`);
        const buffer = fs.readFileSync(req.file.path);
        console.log(`[ADMIN] Read file buffer: ${buffer.length} bytes from ${req.file.path}`);
        const key = `products/${Date.now()}-${req.file.filename}`;
        console.log(`[ADMIN] Calling uploadBuffer with key: ${key}`);
        image = await uploadBuffer(buffer, key, req.file.mimetype);
        images.push(image);
        console.log(`[ADMIN] uploadBuffer returned URL: ${image}`);
      } catch (e) {
        console.error("[ADMIN] Backblaze upload failed:", e.message);
        console.error("[ADMIN] Full error:", e);
        // fallback to local path if upload fails
        image = "/uploads/" + req.file.filename;
        images.push(image);
      } finally {
        // remove the local copy if exists
        try {
          if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            console.log(`[ADMIN] Deleting temporary file: ${req.file.path}`);
            fs.unlinkSync(req.file.path);
          }
        } catch (e) {
          console.warn("[ADMIN] Could not remove temporary upload file", e.message);
        }
      }
    }

    const product = new Product({ 
      name, 
      price, 
      description, 
      longDescription: longDescription || description,
      category: category || 'General',
      stock: stock ? parseInt(stock) : 100,
      usage: usage || '',
      image, 
      images,
      benefits: benefits ? JSON.parse(benefits) : [],
      ingredients: ingredients ? JSON.parse(ingredients) : [],
      tags: tags ? JSON.parse(tags) : [],
      avgRating: 0,
      reviewCount: 0,
      reviews: [],
      metadata 
    });
    
    await product.save();
    res.json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// list products (admin)
router.get("/products", requireAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    
    // If images are Backblaze URLs and bucket is private, return presigned URLs
    const { getPresignedUrl } = require('../config/backblaze');
    const bucket = process.env.B2_BUCKET;

    const productsOut = [];
    for (const p of products) {
      const obj = p.toObject();
      
      // Process main image
      if (obj.image && /^https?:\/\//i.test(obj.image) && bucket && obj.image.includes(bucket)) {
        try {
          // extract key from URL path
          const parsed = new URL(obj.image);
          const key = parsed.pathname.replace(/^\//, '');
          const presigned = await getPresignedUrl(key, 300);
          obj.image = presigned;
        } catch (e) {
          console.warn('Could not create presigned url for main image', obj.image, e && e.message ? e.message : e);
        }
      }
      
      // Process images array
      if (obj.images && Array.isArray(obj.images)) {
        const presignedImages = [];
        for (const img of obj.images) {
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
        obj.images = presignedImages;
      }
      
      productsOut.push(obj);
    }
    
    res.json({ products: productsOut });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// update product (admin) - accepts multipart/form-data image or JSON body
router.put("/products/:id", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const updates = {};
    const { name, price, description, metadata } = req.body;
    if (name) updates.name = name;
    if (price != null) updates.price = price;
    if (description) updates.description = description;
    if (metadata) updates.metadata = metadata;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // handle image replacement
    if (req.file) {
      try {
        console.log(`[ADMIN] Processing product image update: ${req.file.path}`);
        const buffer = fs.readFileSync(req.file.path);
        console.log(`[ADMIN] Read file buffer: ${buffer.length} bytes from ${req.file.path}`);
        const key = `products/${Date.now()}-${req.file.filename}`;
        console.log(`[ADMIN] Calling uploadBuffer with key: ${key}`);
        updates.image = await uploadBuffer(buffer, key, req.file.mimetype);
        console.log(`[ADMIN] uploadBuffer returned URL: ${updates.image}`);
      } catch (e) {
        console.error("[ADMIN] Backblaze upload failed:", e.message);
        console.error("[ADMIN] Full error:", e);
        updates.image = "/uploads/" + req.file.filename;
      } finally {
        try {
          if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            console.log(`[ADMIN] Deleting temporary file: ${req.file.path}`);
            fs.unlinkSync(req.file.path);
          }
        } catch (e) {
          console.warn("[ADMIN] Could not remove temporary upload file", e.message);
        }
      }

      // remove old file if it was uploaded to our uploads dir
      if (product.image && product.image.startsWith("/uploads/")) {
        const oldFull = path.join(__dirname, "..", product.image);
        try {
          if (fs.existsSync(oldFull)) fs.unlinkSync(oldFull);
        } catch (e) {
          console.warn("Could not remove old image", oldFull, e.message);
        }
      }
    }

    Object.assign(product, updates);
    await product.save();
    res.json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// delete product (admin)
router.delete("/products/:id", requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    // remove image file if present in uploads
    if (product.image && product.image.startsWith("/uploads/")) {
      const full = path.join(__dirname, "..", product.image);
      try {
        if (fs.existsSync(full)) fs.unlinkSync(full);
      } catch (e) {
        console.warn("Could not remove image", full, e.message);
      }
    }
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
