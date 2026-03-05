const express = require("express");
const router = express.Router();
const GeneratorDetails = require("../models/GeneratorDetails");

/* =========================
   ADD GENERATOR DETAILS
========================= */
router.post("/", async (req, res) => {
  try {
    console.log("Incoming Data:", req.body); // 🔥 ADD THIS

    const newDetails = new GeneratorDetails(req.body);
    await newDetails.save();

    console.log("Saved Successfully"); // 🔥 ADD THIS

    res.json({ message: "Generator details saved successfully" });
  } catch (err) {
    console.error("SAVE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   GET ALL DETAILS
========================= */
router.get("/", async (req, res) => {
  const data = await GeneratorDetails.find();
  res.json(data);
});

/* =========================
   GET BY TOPIC ID
========================= */
router.get("/:topicId", async (req, res) => {
  const data = await GeneratorDetails.findOne({
    topicId: req.params.topicId,
  });
  res.json(data);
});

module.exports = router;
