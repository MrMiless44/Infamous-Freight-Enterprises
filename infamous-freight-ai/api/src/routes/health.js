const express = require("express");
const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ ok: true, service: "api", time: new Date().toISOString() });
});

router.get("/health/full", (req, res) => {
  const usage = process.memoryUsage();
  res.json({
    ok: true,
    uptimeSec: Math.round(process.uptime()),
    rss: usage.rss,
    heapUsed: usage.heapUsed,
  });
});

module.exports = router;
