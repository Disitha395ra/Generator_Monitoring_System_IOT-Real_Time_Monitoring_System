const express = require("express");
const router = express.Router();
const generatorController = require("../controllers/generatorController");
const authMiddleware = require("../middleware/authMiddleware");

/* =========================
   GET ALL GENERATORS
   URL: /api/generators
========================= */
router.get("/", generatorController.getAllGenerators);

/* =========================
   GET HISTORY
   URL: /api/generators/:id
========================= */
router.get("/:id", generatorController.getGeneratorHistory);

/* =========================
   CONTROL GENERATOR
   URL: /api/generators/control
========================= */
router.post("/control", authMiddleware, generatorController.controlGenerator);

module.exports = router;
