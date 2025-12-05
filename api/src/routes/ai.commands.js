const express = require("express");
const { z } = require("zod");
const { sendCommand } = require("../services/aiSyntheticClient");

const router = express.Router();

const commandSchema = z.object({
  command: z.string().min(1),
  payload: z.any().optional(),
  meta: z.any().optional()
});

router.post("/command", async (req, res, next) => {
  let commandData;
  try {
    commandData = commandSchema.parse(req.body || {});
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return next(error);
  }

  try {
    const result = await sendCommand(
      commandData.command,
      commandData.payload,
      commandData.meta
    );
    res.json({ ok: true, result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
