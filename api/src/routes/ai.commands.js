const express = require("express");
const { sendCommand } = require("../services/aiSyntheticClient");

const router = express.Router();

router.post("/ai/command", async (req, res) => {
  const { command, payload, meta } = req.body || {};
  
  if (!command) {
    return res.status(400).json({ error: "command required" });
  }

  try {
    const result = await sendCommand(command, payload, meta);
    res.json({ ok: true, result });
  } catch (error) {
    console.error("AI command error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
