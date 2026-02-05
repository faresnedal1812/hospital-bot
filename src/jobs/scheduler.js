const corn = require("node-cron");
const Setting = require("../models/setting.model");
const Department = require("../models/department.model");
const submissionService = require("../services/submissionService");
const client = require("../bot/client");
const reportService = require("../services/reportService");
const { MessageMedia } = require("whatsapp-web.js");

const initScheduleJobs = () => {
  // 1. Reminder Job: Daily at 23:00
  corn.schedule("0 23 * * *", async () => {
    console.log("Running Reminder Job...");

    try {
      const setting = await Setting.findOne({ key: "GROUP_ID" });
      if (!setting) {
        console.log("No Group ID configured for reminders.");
        return;
      }

      const groupId = setting.value;

      // Find missing departments
      const departments = await Department.find();
      let missing = [];

      for (const dept of departments) {
        const submitted = await submissionService.hasSubmittedToday(dept._id);
        if (!submitted) {
          missing.push(dept);
        }
      }

      if (missing.length > 0) {
        let message = `⏰ *Daily Statistics Reminder*\n\nThe following departments hav NOT submitted yet:\n`;

        for (const dept of missing) {
          message += `- *${dept.name}*\n`;
        }

        message += "\nPlease submit before midnight using *!submit*";
        await client.sendMessage(groupId, message);
      }
    } catch (error) {
      console.error("Error in Reminder Job:", error);
    }
  });

  // 2. Auto-Report Check (Failsafe at 23:59)
  corn.schedule("59 23 * * *", async () => {
    console.log("Running EOD Report Job..."); // EOD => End of Day

    await checkAndSendReport(true);
  });
};

const checkAndSendReport = async (force = false) => {
  try {
    const setting = await Setting.findOne({ key: "GROUP_ID" });
    if (!setting) return;
    const groupId = setting.value;

    const departments = await Department.find();
    let allSubmitted = true;

    if (!force) {
      for (const dept of departments) {
        const submitted = await submissionService.hasSubmittedToday(dept._id);
        if (!submitted) {
          allSubmitted = false;
          break;
        }
      }
    }

    if (allSubmitted || force) {
      const filePath = await reportService.generateDailyReport();
      if (filePath) {
        const media = MessageMedia.fromFilePath(filePath);
        await client.sendMessage(groupId, media, {
          caption: "📊 *Daily Hospital Statistics Report*",
        });
        console.log("Report sent successfully.");
      }
    }
  } catch (error) {
    console.error("Error sending report:", error);
  }
};

module.exports = {
  initScheduleJobs,
  checkAndSendReport,
};
