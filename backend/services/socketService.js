let io;

const initSocket = (server) => {
  const { Server } = require("socket.io");

  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ Frontend connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("❌ Frontend disconnected:", socket.id);
    });
  });
};

const emitGeneratorUpdate = (data) => {
  if (io) {
    io.emit("generatorUpdate", data);
  }
};

module.exports = { initSocket, emitGeneratorUpdate };
