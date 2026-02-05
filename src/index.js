require("dotenv").config({ quiet: true });
const express = require("express");
const connectDB = require("./config/connectDB");
const client = require("./bot/client");
const handleMessage = require("./bot/messageHandler");
const { initScheduleJobs } = require("./jobs/scheduler");

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hospital Bot Service is Running");
});

client.initialize();
initScheduleJobs();

client.on("message_create", handleMessage);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log("Server is running on port:", PORT));
  } catch (error) {
    console.error("💥 Error in starting the server:", error.message);
    process.exit(1);
  }
};

startServer();
