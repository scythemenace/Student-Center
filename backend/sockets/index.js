const movementHandlers = require("./movementHandlers");
const chatHandlers = require("./chatHandlers");

const users = {}; // Store connected users

function setupSocket(io) {
	io.on("connection", (socket) => {
		console.log(`User connected: ${socket.id}`);

		// Add the user to the state
		users[socket.id] = { x: 0, y: 0, direction: "down" };

		// Send the socket ID back to the client
		socket.emit("yourID", socket.id);

		socket.emit("currentUsers", users);

		socket.broadcast.emit("userConnected", {
			userId: socket.id,
			...users[socket.id],
		});

		movementHandlers(socket, io, users);
		chatHandlers(socket, io, users);

		// Relay signaling data between clients
		socket.on("signal", (data) => {
			const targetSocketId = data.to;
			const targetSocket = io.sockets.sockets.get(targetSocketId);
			if (targetSocket) {
				targetSocket.emit("signal", {
					from: socket.id,
					signalData: data.signalData,
				});
			}
		});

		socket.on("disconnect", () => {
			console.log(`User disconnected: ${socket.id}`);
			delete users[socket.id];
			socket.broadcast.emit("userDisconnected", { userId: socket.id });
		});
	});
}

module.exports = setupSocket;
