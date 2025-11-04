require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Doctor = require("./schema/Doctor");

// Sample doctors data
const sampleDoctors = [
  {
    name: "Dr. Priya Sharma",
    email: "priya.sharma@ayurveda.com",
    password: "doctor123",
    speciality: "Panchakarma",
    clinicAddress: "Mumbai, Maharashtra",
    fee: 1500,
    phone: "+91 9876543210",
  },
  {
    name: "Dr. Arjun Verma",
    email: "arjun.verma@ayurveda.com",
    password: "doctor123",
    speciality: "General Wellness",
    clinicAddress: "Delhi NCR",
    fee: 1200,
    phone: "+91 9876543211",
  },
  {
    name: "Dr. Anjali Patel",
    email: "anjali.patel@ayurveda.com",
    password: "doctor123",
    speciality: "Skin & Hair Care",
    clinicAddress: "Bangalore, Karnataka",
    fee: 1800,
    phone: "+91 9876543212",
  },
  {
    name: "Dr. Rajesh Kumar",
    email: "rajesh.kumar@ayurveda.com",
    password: "doctor123",
    speciality: "Digestive Health",
    clinicAddress: "Pune, Maharashtra",
    fee: 1300,
    phone: "+91 9876543213",
  },
  {
    name: "Dr. Meera Iyer",
    email: "meera.iyer@ayurveda.com",
    password: "doctor123",
    speciality: "Women's Health",
    clinicAddress: "Chennai, Tamil Nadu",
    fee: 1600,
    phone: "+91 9876543214",
  },
  {
    name: "Dr. Vikram Singh",
    email: "vikram.singh@ayurveda.com",
    password: "doctor123",
    speciality: "Joint & Bone Health",
    clinicAddress: "Jaipur, Rajasthan",
    fee: 1400,
    phone: "+91 9876543215",
  },
];

async function seedDoctors() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Clear existing doctors (optional - comment out if you want to keep existing)
    // await Doctor.deleteMany({});
    // console.log("Cleared existing doctors");

    // Add sample doctors
    for (const doctorData of sampleDoctors) {
      // Check if doctor already exists
      const existing = await Doctor.findOne({ email: doctorData.email });
      if (existing) {
        console.log(`Doctor ${doctorData.name} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(doctorData.password, 10);

      // Generate unique ID
      const uniqueId = Math.random().toString(36).slice(2, 9);

      // Create doctor
      const doctor = new Doctor({
        ...doctorData,
        password: hashedPassword,
        uniqueId,
        availability: [
          { day: "Monday", from: "09:00", to: "17:00" },
          { day: "Tuesday", from: "09:00", to: "17:00" },
          { day: "Wednesday", from: "09:00", to: "17:00" },
          { day: "Thursday", from: "09:00", to: "17:00" },
          { day: "Friday", from: "09:00", to: "17:00" },
        ],
      });

      await doctor.save();
      console.log(`✓ Added doctor: ${doctorData.name} (${doctorData.speciality})`);
    }

    console.log("\n✅ Sample doctors added successfully!");
    console.log("You can now view them at http://localhost:3000/doctors");
    
  } catch (error) {
    console.error("Error seeding doctors:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
  }
}

// Run the seed function
seedDoctors();
