const User = require("../models/user.model");
const sessionManager = require("../services/sessionManager");
const submissionService = require("../services/submissionService");
const Setting = require("../models/setting.model");

const handleMessage = async (msg) => {
  try {
    // 1. Identify User
    const contact = await msg.getContact();
    const phoneNumber = contact.number;

    console.log(
      `DEBUG: Received message from ${phoneNumber}: ${msg.body.trim()}`,
    );

    const user = await User.findOne({ phoneNumber }).populate("department");

    if (!user) {
      console.log(`DEBUG: User not found for phone: ${phoneNumber}`);
      return;
    } else {
      console.log(`DEBUG: User found: ${user.name}`);
    }

    // 2. Check Active Session
    const session = sessionManager.getSession(user._id);
    if (session) {
      await handleSessionInput(msg, user, session);
      return;
    }

    // 3. Command Handling
    const body = msg.body.trim().toLowerCase();

    if (!user.department) {
      await msg.reply("❌ You are not assigned to any department.");
      return;
    }

    if (body === "!submit") {
      const alreadySubmitted = await submissionService.hasSubmittedToday(
        user.department._id,
      );
      if (alreadySubmitted) {
        await msg.reply(
          `✅ Department *${user.department.name}* has already submitted statistics for today.`,
        );
        return;
      }

      sessionManager.createSession(user._id, user.department);
      const firstMetric = user.department.metrics[0];

      await msg.reply(
        `Starting submission for *${user.department.name}*.\n\nPlease enter value for *${firstMetric}*`,
      );
      return;
    }

    if (body === "!status") {
      const submitted = await submissionService.hasSubmittedToday(
        user.department._id,
      );
      if (submitted) {
        await msg.reply(
          `Your department *${user.department.name}* has submitted for today.`,
        );
      } else {
        await msg.reply(
          `Your department *${user.department.name}* has NOT submitted yet.`,
        );
      }
    }

    //   Admin Commands
    if (user.isAdmin) {
      if (body === "!setgroup") {
        const chat = await msg.getChat();
        if (chat.isGroup) {
          await Setting.findOneAndUpdate(
            { key: "GROUP_ID" },
            { value: chat.id._serialized },
            { upsert: true, new: true },
          );
          await msg.reply(
            "✅ This bot has beed configured as the primary bot group",
          );
        } else {
          await msg.reply(
            "❌ Please use this command inside the target Whatsapp group.",
          );
        }
        return;
      }

      if (body === "!forcereport") {
        await msg.reply("⏳ Generating report...");
        // todo: await checkAndSendReport(true); // checkAndSendReport handles sending the file
        return;
      }
    }

    if (body === "!ping") {
      await msg.reply("🏓 pong");
      return;
    }
  } catch (error) {
    console.log("Error in handleMessage:", error);
  }
};

const handleSessionInput = async (msg, user, session) => {
  const body = msg.body.trim().toLowerCase();

  // Check for cancellation
  if (body === "!cancel") {
    sessionManager.clearSession(user._id);
    await msg.reply("❌ Submission cancelled");
    return;
  }

  // Handle Confirmation Step
  if (session.step === "CONFIRM") {
    if (body === "!confirm") {
      try {
        await submissionService.createSubmission(
          user._id,
          user.department._id,
          session.data,
        );
        sessionManager.clearSession(user._id);
        await msg.reply(
          `✅ Statistics for *${user.department.name}* have been saved successfully!`,
        );

        // Check if all submitted to send report automatically
        // todo: await checkAndSendReport(false);
      } catch (error) {
        console.error(error.message);
        await msg.reply("❌ Error saving data. Please try again");
      }
    } else {
      await msg.reply("⚠️ Type *!confirm* to save or *!cancel* to discard.");
    }
    return;
  }

  // Handle Data Collection Step
  const metrics = user.department.metrics;
  const currentMetric = metrics[session.currentMetricIndex];

  if (isNaN(body)) {
    await msg.reply(
      `⚠️ Invalid number. Please enter a valid number for *${currentMetric}*.`,
    );
    return;
  }

  session.data[currentMetric] = Number(body);
  session.currentMetricIndex++;

  if (session.currentMetricIndex < metrics.length) {
    const nextMetric = metrics[session.currentMetricIndex];
    await msg.reply(
      `Saved: ${currentMetric} = ${body}\n\nNext: Enter value for ${nextMetric}`,
    );
  } else {
    // Prepare for Confirmation
    let summary = `*Summary for ${session.department.name}*:\n\n`;
    metrics.forEach((metric) => {
      summary += `- ${metric}: ${session.data[metric]}\n`;
    });
    summary += `\n Type *!confirm* to save or *!cancel* to discard.`;

    sessionManager.updateSession(user._id, { step: "CONFIRM" });
    await msg.reply(summary);
  }
};

module.exports = handleMessage;
