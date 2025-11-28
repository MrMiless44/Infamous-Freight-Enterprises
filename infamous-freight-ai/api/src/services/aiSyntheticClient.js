const axios = require("axios");

const url = process.env.AI_SYNTHETIC_ENGINE_URL;
const apiKey = process.env.AI_SYNTHETIC_API_KEY;
const securityMode = process.env.AI_SECURITY_MODE || "strict";

async function sendCommand(command, payload, meta = {}) {
  const body = {
    command,
    payload,
    meta,
  };

  const res = await axios.post(url, body, {
    headers: {
      "x-api-key": apiKey,
      "x-security-mode": securityMode,
    },
    timeout: 15000,
  });

  return res.data;
}

module.exports = { sendCommand };
