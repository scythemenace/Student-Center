module.exports = (socket, io, users) => {
  function isWithinProximity(user1, user2, threshold = 50) {
    const dx = user1.x - user2.x;
    const dy = user1.y - user2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= threshold;
  }

  socket.on("chatMessage", (data) => {
    const sender = users[socket.id];
    if (!sender) {
      console.error("Chat sender not found:", socket.id);
      return;
    }

    console.log(`User ${socket.id} sent message: ${data.message}`);

    for (const [id, user] of Object.entries(users)) {
      if (id !== socket.id && isWithinProximity(sender, user)) {
        io.to(id).emit("chatMessage", {
          userId: socket.id,
          message: data.message,
        });
      }
    }
  });
};
