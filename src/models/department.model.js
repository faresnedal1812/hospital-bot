const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    metrics: [
      {
        type: String, // e.g., "Admissions", "Discharges" on Emergency department
        required: true,
      },
    ],
    // Optional: users who are responsible, can be used for reminders
    responsibleUser: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Department", departmentSchema);
