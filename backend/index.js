const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const setupSocket = require("./sockets");
require("dotenv").config();

// Use CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Replace with your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

const rootRouter = require("./routes/index");
app.use("/api/v1", rootRouter);

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Ensure the frontend URL is allowed
    methods: ["GET", "POST"],
  },
});

setupSocket(io);

const port = process.env.PORT || 3000;

server.listen(port, (err) => {
  if (err) console.log(err);
  console.log("Server listening on PORT", port);
});

module.exports = app;
