// socket/index.js
const express = require("express");
const fs = require("fs");
const app = express();
const cors = require("cors");
const https = require("https");
const socketIo = require("socket.io");
const { ExpressPeerServer } = require("peer"); // Import the PeerServer
const setupSocket = require("./sockets");
require("dotenv").config();
const privateKey = fs.readFileSync("./key.pem", "utf8");
const certificate = fs.readFileSync("./cert.pem", "utf8");
const credentials = { key: privateKey, cert: certificate };

// Use CORS
app.use(
	cors({
		origin: process.env.FRONTEND_URL || "https://localhost:5173", // Replace with your frontend URL
		methods: ["GET", "POST", "PUT", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization"],
	})
);

app.use(express.json());

const rootRouter = require("./routes/index");
app.use("/api/v1", rootRouter);

// Create HTTP or HTTPS server (adjusted for HTTPS if needed)
const server = https.createServer(credentials, app);

// Initialize Socket.IO
const io = socketIo(server, {
	cors: {
		origin: process.env.FRONTEND_URL || "http://localhost:5173", // Ensure the frontend URL is allowed
		methods: ["GET", "POST"],
	},
});

// Initialize PeerJS Server
const peerServer = ExpressPeerServer(server, {
	debug: true,
	path: "/peerjs",
});

// Use the PeerJS server as middleware
app.use("/peerjs", peerServer);

// Setup Socket.IO handlers
setupSocket(io);

const port = process.env.PORT || 3000;

server.listen(port, (err) => {
	if (err) console.log(err);
	console.log("Server listening on PORT", port);
});

module.exports = app;
