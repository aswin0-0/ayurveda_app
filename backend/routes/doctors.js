const express = require("express");
const bcrypt = require("bcrypt");
const Doctor = require("../schema/Doctor");
const { requireAuth } = require("../middleware/auth");

const jwt = require("jsonwebtoken");
const router = express.Router();
// parse JSON bodies for this router even if client omits Content-Type header
router.use(express.json({ type: "*/*" }));

// create a doctor account (minimal). Frontend can call this to add doctors.
router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      clinicAddress,
      fee,
      uniqueId,
      phone,
    } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Missing fields" });
    const existing = await Doctor.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already in use" });
    const hash = await bcrypt.hash(password, 10);
    // if uniqueId not provided, generate a short random uniqueId
    const genId = () => Math.random().toString(36).slice(2, 9);
    const finalUniqueId = uniqueId || genId();

    const d = new Doctor({
      name,
      email,
      password: hash,
      speciality,
      clinicAddress,
      fee,
      uniqueId: finalUniqueId,
      phone,
    });
    await d.save();
    res.json({ doctor: { id: d._id, name: d.name, email: d.email } });
  } catch (err) {
    console.error(err);
    // handle duplicate key errors (e.g., uniqueId or email)
    if (err && err.code === 11000) {
      const dupField = Object.keys(err.keyPattern || {})[0] || "field";
      return res.status(409).json({ message: `${dupField} already exists` });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// doctor login to receive JWT
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });
    const doctor = await Doctor.findOne({ email });
    if (!doctor)
      return res.status(400).json({ message: "Invalid credentials" });
    const match = await bcrypt.compare(password, doctor.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign(
      { id: doctor._id, email: doctor.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({
      token,
      doctor: { id: doctor._id, name: doctor.name, email: doctor.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// search doctors by name, speciality or clinic address
router.get("/", async (req, res) => {
  try {
    const q = req.query.q;
    const filter = {};
    if (q) {
      const re = new RegExp(q, "i");
      filter.$or = [{ name: re }, { speciality: re }, { clinicAddress: re }];
    }
    const docs = await Doctor.find(filter).select("-password");
    res.json({ doctors: docs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// get doctor by id
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const d = await Doctor.findById(req.params.id).select("-password");
    if (!d) return res.status(404).json({ message: "Doctor not found" });
    res.json({ doctor: d });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

// update doctor profile (self)
router.patch("/me", requireAuth, async (req, res) => {
  try {
    const id = req.user.id;
    const { name, speciality, clinicAddress, fee, phone, password } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (speciality) updates.speciality = speciality;
    if (clinicAddress) updates.clinicAddress = clinicAddress;
    if (fee !== undefined) updates.fee = fee;
    if (phone) updates.phone = phone;
    if (password) updates.password = await bcrypt.hash(password, 10);
    const doc = await Doctor.findByIdAndUpdate(id, updates, {
      new: true,
    }).select("-password");
    if (!doc) return res.status(404).json({ message: "Doctor not found" });
    res.json({ doctor: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// delete doctor account (self)
router.delete("/me", requireAuth, async (req, res) => {
  try {
    const id = req.user.id;
    const doc = await Doctor.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ message: "Doctor not found" });
    res.json({ message: "Doctor deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
