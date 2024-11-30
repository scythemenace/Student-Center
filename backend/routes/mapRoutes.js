const express = require("express");
const router = express.Router();

const mapData = {
  width: 800,
  height: 600,
  tiles: [],
  interactiveObjects: [],
};

// GET /map
router.get("/map", (req, res) => {
  res.json({ map: mapData });
});

module.exports = router;
