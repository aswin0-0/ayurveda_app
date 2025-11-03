require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const {
  router: authRouter,
  signupHandler,
  loginHandler,
} = require("./routes/auth");
const doctorsRouter = require("./routes/doctors");
const appointmentsRouter = require("./routes/appointments");
const adminRouter = require("./routes/admin");
const cartRouter = require("./routes/cart");
const productsRouter = require("./routes/products");
const ordersRouter = require("./routes/orders");
const paymentRouter = require("./routes/payment");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

// check required env vars early
const missing = [];
if (!process.env.MONGO_URI) missing.push("MONGO_URI");
if (!process.env.JWT_SECRET) missing.push("JWT_SECRET");
if (!process.env.RAZORPAY_KEY_ID) missing.push("RAZORPAY_KEY_ID");
if (!process.env.RAZORPAY_KEY_SECRET) missing.push("RAZORPAY_KEY_SECRET");

if (missing.length) {
  console.error(
    "ERROR: Missing required environment variable(s):",
    missing.join(", ")
  );
  console.error(
    "Create backend/.env with at least:\nMONGO_URI=...\nJWT_SECRET=...\nRAZORPAY_KEY_ID=...\nRAZORPAY_KEY_SECRET=...\nPORT=5000"
  );
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => res.send("API running"));

// Configure CORS to allow deployed frontends. Read allowed origins from
// the environment variable ALLOWED_ORIGINS (comma-separated). This keeps
// deployed URLs out of source code and lets you configure them in Render/Vercel.
const rawAllowed = process.env.ALLOWED_ORIGINS || "http://localhost:3000";
const allowedOrigins = rawAllowed
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
  .map((origin) => origin.replace(/\/+$/, ""));

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    const normalized = origin.replace(/\/+$/, "");
    if (allowedOrigins.indexOf(normalized) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// mount auth routes at /auth
app.use("/auth", authRouter);

// also expose root-level login/signup for convenience
app.post("/signup", signupHandler);
app.post("/login", loginHandler);

// connect and start
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    // mount application routes after DB connect
    // mount doctors routes at both /doctors and /doctor (accept singular from some clients)
    app.use("/doctors", doctorsRouter);
    app.use("/doctor", doctorsRouter);
    app.use("/appointments", appointmentsRouter);
  // serve uploaded files (product images) from /uploads
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  // public products listing and detail
  app.use("/products", productsRouter);

    // mount admin and cart routes
    app.use("/admin", adminRouter);
    app.use("/cart", cartRouter);
  app.use("/orders", ordersRouter);
  app.use("/payment", paymentRouter);

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
