const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

/* 🔹 Seed Admin (Run Once Automatically) */
exports.seedAdmin = async () => {
  const existing = await Admin.findOne({
    username: process.env.ADMIN_USERNAME,
  });

  if (!existing) {
    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    await Admin.create({
      username: process.env.ADMIN_USERNAME,
      password: hashed,
    });

    console.log("✅ Default Admin Created");
  }
};

/* 🔹 Login */
exports.login = async (req, res) => {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ username });
  if (!admin) return res.status(401).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(password, admin.password);
  if (!match) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: admin._id, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "8h" },
  );

  res.json({ token });
};
