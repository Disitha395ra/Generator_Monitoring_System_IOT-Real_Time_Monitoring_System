const GeneratorDetails = require("../models/GeneratorDetails");

/* ==================================
   ADD GENERATOR DETAILS
================================== */
exports.addGenerator = async (req, res) => {
  try {
    const newDetails = new GeneratorDetails(req.body);
    await newDetails.save();

    res.json({
      success: true,
      message: "Generator details saved successfully",
      data: newDetails,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/* ==================================
   GET ALL GENERATORS
================================== */
exports.getAllGenerators = async (req, res) => {
  try {
    const data = await GeneratorDetails.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ==================================
   GET GENERATOR BY TOPIC ID
================================== */
exports.getGeneratorByTopicId = async (req, res) => {
  try {
    const data = await GeneratorDetails.findOne({
      topicId: req.params.topicId,
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ==================================
   ADD SERVICE RECORD
================================== */
exports.addServiceRecord = async (req, res) => {
  try {
    const { topicId } = req.params;

    const generator = await GeneratorDetails.findOne({ topicId });

    if (!generator) {
      return res.status(404).json({ message: "Generator not found" });
    }

    const serviceData = {
      serviceName: req.body.serviceName,
      serviceDate: req.body.serviceDate,
      nextServiceDate: req.body.nextServiceDate,
      technician: req.body.technician,
      notes: req.body.notes,
    };

    generator.serviceHistory.push(serviceData);

    await generator.save();

    res.status(201).json({
      message: "Service record added successfully",
      data: serviceData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

/* ==================================
   GET SERVICE HISTORY
================================== */
// GET SERVICE HISTORY
exports.getServiceHistory = async (req, res) => {
  try {
    const { topicId } = req.params;

    // Find generator by topicId or fallback to _id
    let generator = await GeneratorDetails.findOne({ topicId });
    if (!generator) {
      generator = await GeneratorDetails.findById(topicId);
    }

    if (!generator) {
      return res.status(404).json({ message: "Generator not found" });
    }

    // Return serviceHistory or empty array
    res.json(generator.serviceHistory || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
/* ==================================
   GET NEXT SERVICE ALERT
================================== */
exports.getNextServiceAlert = async (req, res) => {
  try {
    const today = new Date();

    const generators = await GeneratorDetails.find({
      "serviceHistory.nextServiceDate": { $gte: today },
    });

    const upcomingServices = [];

    generators.forEach((generator) => {
      generator.serviceHistory.forEach((service) => {
        if (service.nextServiceDate && service.nextServiceDate >= today) {
          upcomingServices.push({
            topicId: generator.topicId,
            generatorName: generator.generatorName,
            customerName: generator.customerName,
            serviceName: service.serviceName,
            serviceDate: service.serviceDate,
            nextServiceDate: service.nextServiceDate,
            technician: service.technician,
          });
        }
      });
    });

    upcomingServices.sort(
      (a, b) => new Date(a.nextServiceDate) - new Date(b.nextServiceDate),
    );

    res.json(upcomingServices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
