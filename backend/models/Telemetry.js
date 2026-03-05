const mongoose = require("mongoose");

const telemetrySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      index: true,
    },

    voltage: { type: Number, default: 0 },
    current: { type: Number, default: 0 },
    power: { type: Number, default: 0 },
    energy: { type: Number, default: 0 },
    frequency: { type: Number, default: 0 },
    pf: { type: Number, default: 0 },

    // Engine Parameters
    oilPressure: { type: Number, default: 0 },
    coolerTemp: { type: Number, default: 0 },
    fuelLevel: { type: Number, default: 0 },

    state: {
      type: String,
      enum: ["ON", "OFF", "FAULT", "MAINTENANCE"],
      default: "OFF",
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  },
);

/* =========================
   INDEXES
========================= */

// Fast lookup for latest telemetry per generator
telemetrySchema.index({ id: 1, timestamp: -1 });

module.exports = mongoose.model("Telemetry", telemetrySchema);
