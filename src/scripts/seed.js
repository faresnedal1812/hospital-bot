require("dotenv").config({ quiet: true });
const User = require("../models/user.model");
const Department = require("../models/department.model");
const connectDB = require("../config/connectDB");

const seedData = async () => {
  try {
    await connectDB();

    if (
      process.env.NODE_ENV === "production" &&
      process.env.SEED_CONFIRM !== "YES"
    ) {
      throw new Error(
        "Refusing to seed in production without SEED_CONFIRM=YES",
      );
    }

    console.log("Clearing old data...");
    await Department.deleteMany({});
    await User.deleteMany({});

    console.log("Creating Departments...");
    const dept01 = await Department.create({
      name: "Emergency",
      metrics: ["Admission", "Discharges", "Surgeries"],
    });
    const dept02 = await Department.create({
      name: "ICU",
      metrics: ["Occupancy", "Ventilators In Use", "Deaths"],
    });

    console.log("Creating Users...");

    const adminPhone = process.env.ADMIN_PHONE_NUMBER;
    const emergencyPhone = process.env.SEED_EMERGENCY_PHONE_NUMBER;
    const icuPhone = process.env.SEED_ICU_PHONE_NUMBER;
    if (!adminPhone || !emergencyPhone || !icuPhone) {
      throw new Error(
        "Missing required seed phone numbers (ADMIN/EMERGENCY/ICU).",
      );
    }

    // Admin User
    await User.create({
      phoneNumber: adminPhone, // Format: CountryCode + Number (No + or 00)
      name: process.env.SEED_ADMIN_NAME || "Seed Admin",
      isAdmin: true,
    });

    // Dept01 User
    await User.create({
      phoneNumber: emergencyPhone,
      name: process.env.SEED_EMERGENCY_NAME || "Seed Emergency",
      department: dept01._id,
    });

    // Dept02 User
    await User.create({
      phoneNumber: icuPhone,
      name: process.env.SEED_ICU_NAME || "Seed ICU",
      department: dept02._id,
    });

    console.log("Data Seeded!");
    process.exit(0);
  } catch (error) {
    console.error("Error in seedData:", error.message);
    process.exit(1);
  }
};

seedData();
