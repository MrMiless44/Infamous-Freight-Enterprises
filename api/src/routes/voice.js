const express = require("express");
const multer = require("multer");
const { z } = require("zod");
const { sendCommand } = require("../services/aiSyntheticClient");

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
const textSchema = z.object({ text: z.string().min(1) });

router.post("/ingest", upload.single("audio"), async (req, res, next) => {
  if (!req.file) return res.status(400).json({ error: "audio required" });

  try {
    // Here you would call Whisper/OpenAI etc.
    const transcript = "(simulated) Driver says: optimize route to Chicago";

    const result = await sendCommand("voice.input", { transcript });

    res.json({ ok: true, transcript, ai: result });
  } catch (error) {
    next(error);
  }
});

router.post("/command", async (req, res, next) => {
  let payload;
  try {
    payload = textSchema.parse(req.body || {});
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return next(error);
  }

  try {
    const result = await sendCommand("voice.command", { text: payload.text });
    res.json({ ok: true, result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
