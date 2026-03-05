require("dotenv").config();
const express = require("express");
const cors = require("cors");

const generatorRoutes = require("./routes/generatorRoutes");
const authRoutes = require("./routes/authRoutes");
const generatorDetailsRoutes = require("./routes/generatorDetails");

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());
app.use(express.json());

/* =========================
   ROUTES
========================= */

app.use("/api/generators", generatorRoutes); // telemetry
app.use("/api/generator-details", generatorDetailsRoutes); // details
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Generator Monitoring Backend Running");
});

module.exports = app;
