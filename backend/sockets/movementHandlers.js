module.exports = (socket, io, users) => {
  socket.on("move", (data) => {
    if (data.x === undefined || data.y === undefined) {
      console.error("Invalid move data:", data);
      return;
    }

    // Update user's position
    users[socket.id].x = data.x;
    users[socket.id].y = data.y;

    console.log(`User ${socket.id} moved to (${data.x}, ${data.y})`);

    // Broadcast movement to others
    socket.broadcast.emit("userMoved", {
      userId: socket.id,
      x: data.x,
      y: data.y,
    });
  });
};
