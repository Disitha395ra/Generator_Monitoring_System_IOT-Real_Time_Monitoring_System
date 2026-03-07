const express = require("express");
const router = express.Router();

const generatorController = require("../controllers/GeneratorDetailController");

/* ===============================
   GENERATOR ROUTES
=============================== */

router.post("/", generatorController.addGenerator);

router.get("/", generatorController.getAllGenerators);

/* ===============================
   SERVICE ROUTES
=============================== */

// add service
router.post("/service/:topicId", generatorController.addServiceRecord);

// get service history
router.get("/service/history/:topicId", generatorController.getServiceHistory);

// next service alerts
router.get("/service/alerts/next", generatorController.getNextServiceAlert);

/* ===============================
   GET BY TOPIC ID
   ⚠ MUST BE LAST
=============================== */

router.get("/:topicId", generatorController.getGeneratorByTopicId);

module.exports = router;
