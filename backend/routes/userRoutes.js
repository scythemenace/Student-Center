const express = require("express");
const router = express.Router();

// Mock users object (replace with database if needed)
const users = {};

// GET /users
router.get("/users", (req, res) => {
  res.json({ users });
});

module.exports = router;
