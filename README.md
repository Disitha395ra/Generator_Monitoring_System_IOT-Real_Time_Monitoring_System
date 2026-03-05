# ⚡ Generator Monitoring System - Backend

A real-time Generator Monitoring & Control System built using:

- Node.js
- Express.js
- MongoDB
- Mongoose
- MQTT (HiveMQ Broker)
- Socket.IO
- JWT Authentication

This backend handles:
- Real-time telemetry ingestion via MQTT
- Storage in MongoDB
- Live updates using Socket.IO
- Admin authentication with JWT
- Secure generator control API

---

# 🚀 Features

✔ Real-time telemetry tracking  
✔ Admin-only login system  
✔ JWT-based authentication  
✔ Secure control commands  
✔ Scalable MVC architecture  
✔ Production-ready structure  

---

# 📦 Installation
npm install


# 📦 .env file
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/generatorDB
MQTT_BROKER=mqtt://broker.hivemq.com
FRONTEND_URL=http://localhost:5173

JWT_SECRET=your_super_secret_key
ADMIN_USERNAME=""
ADMIN_PASSWORD=""

# 📦 Run Project
npm start
npm run dev
