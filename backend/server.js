// server.js

require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const app = require("./app");
const { initSocket } = require("./services/socketService");
require("./config/mqtt");
const { seedAdmin } = require("./controllers/authController");

const PORT = process.env.PORT || 5000;

/* =========================
   CONNECT DATABASE
========================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");

    // Seed admin after DB connection
    await seedAdmin();

    const server = http.createServer(app);

    initSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  });
