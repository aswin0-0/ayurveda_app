const mongoose = require("mongoose");

// Patient (user) schema - kept intentionally minimal. New doctor users are
// stored in a separate `Doctor` model.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["patient"], default: "patient" },
  accountType: { type: String, enum: ["free", "pro"], default: "free" }, //pro users may have extra features later
    phone: { type: String },
    address: { type: String },
    // cart stores product references and quantities for quick cart operations
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
      },
    ],
    // lightweight history reference - not strictly required but convenient
    // for later queries. We'll store appointment references here when created.
    records: [{ type: mongoose.Schema.Types.ObjectId, ref: "Appointment" }],
    // orders placed by the user
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
