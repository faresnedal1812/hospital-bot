const Submission = require("../models/submission.model");

const hasSubmittedToday = async (departmentId) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const count = await Submission.countDocuments({
      department: departmentId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    return count > 0;
  } catch (error) {
    console.log("hasSubmittedToday error:", error.message);
    throw error;
  }
};

const createSubmission = async (userId, departmentId, data) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const newSubmission = await new Submission({
      date: startOfDay,
      department: departmentId,
      submittedBy: userId,
      data,
    }).save();

    return await newSubmission.populate(["department", "submittedBy"]);
  } catch (error) {
    console.log("createSubmission error:", error.message);
    throw error;
  }
};

const getDailySubmission = async () => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const submissions = await Submission.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate("department")
      .populate("submittedBy");

    return submissions;
  } catch (error) {
    console.log("getDailySubmission error:", error.message);
    throw error;
  }
};

module.exports = {
  hasSubmittedToday,
  createSubmission,
  getDailySubmission,
};
