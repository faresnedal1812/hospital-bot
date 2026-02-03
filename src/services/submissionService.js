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
    console.log(error.message);
  }
};

const createSubmission = async (userId, departmentId, data) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const newSubmission = new Submission({
      date: startOfDay,
      department: departmentId,
      submittedBy: userId,
      data,
    })
      .populate("department")
      .populate("submittedBy");

    return await newSubmission.save();
  } catch (error) {
    console.log(error.message);
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
      .populate("submittedBys");

    return submissions;
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  hasSubmittedToday,
  createSubmission,
  getDailySubmission,
};
