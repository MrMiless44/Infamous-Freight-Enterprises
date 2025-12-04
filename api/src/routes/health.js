const express = require("express");
const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "Infæmous Freight API",
    timestamp: new Date().toISOString(),
    version: "2.0.0"
  });
});

module.exports = router;
