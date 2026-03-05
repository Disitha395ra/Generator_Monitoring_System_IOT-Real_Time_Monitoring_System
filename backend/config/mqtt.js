const mqtt = require("mqtt");
const Telemetry = require("../models/Telemetry");
const { emitGeneratorUpdate } = require("../services/socketService");

const client = mqtt.connect(process.env.MQTT_BROKER);

client.on("connect", () => {
  console.log("✅ MQTT Connected");

  client.subscribe("synterait/genset/+/telemetry", (err) => {
    if (err) console.error("❌ MQTT Subscribe Error:", err);
    else console.log("📡 Subscribed to genset telemetry");
  });
});

client.on("message", async (topic, message) => {
  try {
    const rawData = JSON.parse(message.toString());
    if (!rawData.id) return;

    const formattedData = {
      id: rawData.id,
      voltage: Number(rawData.voltage) || 0,
      current: Number(rawData.current) || 0,
      power: Number(rawData.power) || 0,
      energy: Number(rawData.energy) || 0,
      frequency: Number(rawData.freq) || 0,
      pf: Number(rawData.pf) || 0,
      oilPressure: Number(rawData.oilPressure) || 0,
      coolerTemp: Number(rawData.coolerTemp) || 0,
      fuelLevel: Number(rawData.fuelLevel) || 0,

      state: rawData.state || "OFF",
    };

    const savedData = await Telemetry.create(formattedData);

    emitGeneratorUpdate(savedData);

    console.log("📥 Data saved from:", savedData.id);
  } catch (err) {
    console.error("❌ MQTT Message Error:", err.message);
  }
});

module.exports = client;
