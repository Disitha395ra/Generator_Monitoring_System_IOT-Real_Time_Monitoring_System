const Telemetry = require("../models/Telemetry");
const GeneratorDetails = require("../models/GeneratorDetails");
const mqttClient = require("../config/mqtt");

/* =====================================================
   GET ALL GENERATORS (LATEST TELEMETRY + DETAILS)
   URL: GET /api/generators
===================================================== */
exports.getAllGenerators = async (req, res) => {
  try {
    // 1️⃣ Get latest telemetry per generator
    const latestTelemetry = await Telemetry.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$id",
          doc: { $first: "$$ROOT" },
        },
      },
    ]);

    // 2️⃣ Merge with GeneratorDetails
    const mergedData = await Promise.all(
      latestTelemetry.map(async (item) => {
        const telemetry = item.doc;

        const details = await GeneratorDetails.findOne({
          topicId: telemetry.id,
        });

        return {
          ...telemetry,

          // Attach details safely
          generatorName: details?.generatorName || null,
          manufacturer: details?.manufacturer || null,
          location: details?.location || null,
          customerName: details?.customerName || null,
          customerCompany: details?.customerCompany || null,
          customerContact: details?.customerContact || null,
          customerEmail: details?.customerEmail || null,
          notes: details?.notes || null,
        };
      }),
    );

    res.json(mergedData);
  } catch (err) {
    console.error("GET ALL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   GET GENERATOR HISTORY + DETAILS
   URL: GET /api/generators/:id
===================================================== */
exports.getGeneratorHistory = async (req, res) => {
  try {
    const id = req.params.id;

    // 1️⃣ Get last 100 telemetry records
    const history = await Telemetry.find({ id })
      .sort({ timestamp: -1 })
      .limit(100);

    // 2️⃣ Get generator static details
    const details = await GeneratorDetails.findOne({
      topicId: id,
    });

    // 3️⃣ Return combined object
    res.json({
      details,
      history,
    });
  } catch (err) {
    console.error("HISTORY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   CONTROL GENERATOR
   URL: POST /api/generators/control
===================================================== */
exports.controlGenerator = (req, res) => {
  const { id, state } = req.body;

  if (!id || !state) {
    return res.status(400).json({ error: "Missing id or state" });
  }

  const topic = `synterait/genset/${id}/control`;

  mqttClient.publish(topic, JSON.stringify({ state }));

  console.log(`🎛 Control sent to ${id}: ${state}`);

  res.json({ success: true });
};
