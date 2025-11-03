const express = require("express");
const Appointment = require("../schema/Appointment");
const User = require("../schema/User");
const Doctor = require("../schema/Doctor");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// patient creates an appointment request (without payment - payment happens separately)
router.post("/request", requireAuth, async (req, res) => {
  try {
    const { doctorId, date, mode, notes } = req.body;
    if (!doctorId || !date)
      return res.status(400).json({ message: "Missing fields" });
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const patient = await User.findById(req.user.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const appt = new Appointment({
      patient: patient._id,
      doctor: doctor._id,
      date: new Date(date),
      mode: mode || "online",
      fee: doctor.fee || 0,
      notes,
      payment_status: "pending", // Payment is pending initially
    });
    await appt.save();

    // attach to patient records for convenience
    patient.records = patient.records || [];
    patient.records.push(appt._id);
    await patient.save();

    // Return the appointment - frontend will initiate payment using the appointmentId
    res.json({ 
      appointment: appt,
      message: "Appointment created. Please complete payment to confirm.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// doctor lists appointments assigned to them (requires auth)
router.get("/doctor", requireAuth, async (req, res) => {
  try {
    // we assume the requester is a doctor; in a fuller app you'd verify role
    const docs = await Appointment.find({ doctor: req.user.id }).populate(
      "patient",
      "-password"
    );
    res.json({ appointments: docs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// patient lists their appointments (requires auth)
router.get("/", requireAuth, async (req, res) => {
  try {
    const appts = await Appointment.find({ patient: req.user.id })
      .populate("doctor", "name speciality clinicAddress fee")
      .sort({ date: -1 });
    res.json({ appointments: appts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// patient (or doctor) fetch a single appointment and see status
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id)
      .populate("doctor", "name speciality clinicAddress fee")
      .populate("patient", "name email");
    if (!appt)
      return res.status(404).json({ message: "Appointment not found" });

    // only the patient or the doctor associated can view this appointment
    const uid = String(req.user.id);
    if (String(appt.patient._id) !== uid && String(appt.doctor._id) !== uid)
      return res.status(403).json({ message: "Not allowed" });

    res.json({ appointment: appt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// doctor confirms an appointment (marks status and logs patient)
router.post("/:id/confirm", requireAuth, async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt)
      return res.status(404).json({ message: "Appointment not found" });
    // ensure the doctor owns this appointment
    if (String(appt.doctor) !== String(req.user.id))
      return res.status(403).json({ message: "Not allowed" });

    // Check if payment is completed before confirming
    if (appt.payment_status !== "paid") {
      return res.status(400).json({ 
        message: "Payment must be completed before confirming appointment" 
      });
    }

    appt.status = "confirmed";
    await appt.save();

    // add to doctor's patient logs
    const doctor = await Doctor.findById(req.user.id);
    if (doctor) {
      doctor.patientLogs = doctor.patientLogs || [];
      doctor.patientLogs.push({
        patient: appt.patient,
        date: appt.date,
        feeCharged: appt.fee,
      });
      await doctor.save();
    }

    res.json({ appointment: appt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
