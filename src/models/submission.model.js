const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    /*
     Using Map we can store any number of statistics dynamically without needing to define each key in advance in the Schema.
     e.g. =>
     data: {
    "patients": 25,
    "emergencyCases": 5,
    "surgeries": 2
    "...": ..
    "...": ..
    }
    */
    data: {
      type: Map,
      of: Number,
      required: true,
    },
    // data: [
    //   {
    //     metric: {
    //       type: String,
    //       required: true,
    //     },
    //     value: {
    //       type: Number,
    //       required: true,
    //     },
    //   },
    // ],
  },
  { timestamps: true },
);

// Compound Index => To ensure that there is no more than one submission per day for the same department
submissionSchema.index({ date: 1, department: 1 }, { unique: true });

const Submission = mongoose.model("Submission", submissionSchema);

module.exports = Submission;
