const express = require("express");
const router = express.Router();
const authHybrid = require("../middleware/auth.hybrid");
const scopeGuard = require("../middleware/scopeGuard");
const rateLimit = require("../middleware/rateLimit");
const audit = require("../middleware/audit");
const { sendCommand } = require("../services/aiSyntheticClient");

const AI_SCOPES = ["ai:query", "data:read"];

router.post(
  "/ai/command",
  authHybrid,
  scopeGuard(AI_SCOPES),
  rateLimit({ points: 120, duration: 60 }),
  audit,
  async (req, res) => {
    const { command, payload } = req.body || {};
    if (!command) {
      return res.status(400).json({ error: "command is required" });
    }

    try {
      const result = await sendCommand(command, payload || {}, {
        subject: req.auth?.subject,
        mode: req.auth?.mode,
      });

      res.json({
        ok: true,
        command,
        result,
      });
    } catch (e) {
      console.error("AI command error:", e.message);
      res.status(502).json({ error: "AI engine error", detail: e.message });
    }
  }
);

module.exports = router;
