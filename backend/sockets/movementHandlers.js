module.exports = (socket, io, users) => {
  socket.on("move", (data) => {
    // Update user's position
    users[socket.id].x = data.x;
    users[socket.id].y = data.y;
    users[socket.id].direction = data.direction;

    // Broadcast movement to others
    socket.broadcast.emit("userMoved", {
      userId: socket.id,
      x: data.x,
      y: data.y,
      direction: data.direction,
    });
  });
};
