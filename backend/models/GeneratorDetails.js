const mongoose = require("mongoose");

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
  },
  {
    timestamps: true, // 🔥 adds createdAt & updatedAt
  },
);

module.exports = mongoose.model("GeneratorDetails", generatorDetailsSchema);
