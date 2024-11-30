const movementHandlers = require("./movementHandlers");
const chatHandlers = require("./chatHandlers");

const users = {}; // Store connected users

function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Add the user to the state
    users[socket.id] = { x: 0, y: 0, direction: "down" };

    // Set up individual event handlers
    movementHandlers(socket, io, users);
    chatHandlers(socket, io, users);

    // Notify others of disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      delete users[socket.id];
      socket.broadcast.emit("userDisconnected", { userId: socket.id });
    });
  });
}

module.exports = setupSocket;
