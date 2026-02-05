require("dotenv").config({ quiet: true });
const User = require("../models/user.model");
const Department = require("../models/department.model");
const connectDB = require("../config/connectDB");

const seedData = async () => {
  try {
    await connectDB();

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

    // Admin User
    await User.create({
      phoneNumber: process.env.ADMIN_PHONE_NUMBER, // Format: CountryCode + Number (No + or 00)
      name: "Fares Nedal Bot",
      isAdmin: true,
    });

    // Dept01 User
    await User.create({
      phoneNumber: "972592477978",
      name: "Fares Nedal Emergency",
      department: dept01._id,
    });

    // Dept02 User
    await User.create({
      phoneNumber: "972597026859",
      name: "Oday Nedal ICU",
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
