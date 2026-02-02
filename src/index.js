require("dotenv").config({ quiet: true });
const express = require("express");
const connectDB = require("./config/connectDB");

const app = express();

const PORT = process.env.PORT || 3000;

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
