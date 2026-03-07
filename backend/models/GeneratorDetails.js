const mongoose = require("mongoose");

/* ===============================
   SERVICE HISTORY SCHEMA
================================ */
const serviceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },
    serviceDate: {
      type: Date,
      required: true,
    },
    nextServiceDate: {
      type: Date,
    },
    technician: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

/* ===============================
   GENERATOR DETAILS SCHEMA
================================ */
const generatorDetailsSchema = new mongoose.Schema(
  {
    topicId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    generatorName: {
      type: String,
      trim: true,
    },

    manufacturer: {
      type: String,
      trim: true,
    },

    location: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
        trim: true,
      },
    },

    customerName: {
      type: String,
      trim: true,
    },

    customerCompany: {
      type: String,
      trim: true,
    },

    customerContact: {
      type: String,
      trim: true,
    },

    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    /* 🔥 SERVICE HISTORY ARRAY */
    serviceHistory: [serviceSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("GeneratorDetails", generatorDetailsSchema);