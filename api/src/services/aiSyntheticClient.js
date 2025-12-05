const axios = require("axios");
const OpenAI = require("openai");
const Anthropic = require("@anthropic-ai/sdk");

const mode = process.env.AI_PROVIDER || "synthetic";

const syntheticUrl = process.env.AI_SYNTHETIC_ENGINE_URL;
const syntheticKey = process.env.AI_SYNTHETIC_API_KEY;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

function ensureClient(client, name) {
  if (!client) {
    throw new Error(`${name} client not configured`);
  }
  return client;
}

async function sendSynthetic(command, payload, meta) {
  if (!syntheticUrl || !syntheticKey) {
    throw new Error("Synthetic AI endpoint is not configured");
  }
  const res = await axios.post(
    syntheticUrl,
    { command, payload, meta },
    {
      headers: {
        "x-api-key": syntheticKey,
        "x-security-mode": process.env.AI_SECURITY_MODE || "strict"
      }
    }
  );
  return res.data;
}

async function sendOpenAI(command, payload) {
  ensureClient(openai, "OpenAI");
  const prompt = `You are an AI logistics agent.\nCommand: ${command}\nPayload: ${JSON.stringify(payload)}`;
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });
  return { provider: "openai", text: res.choices[0].message.content };
}

async function sendAnthropic(command, payload) {
  ensureClient(anthropic, "Anthropic");
  const prompt = `You are an AI logistics agent.\nCommand: ${command}\nPayload: ${JSON.stringify(payload)}`;
  const res = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 256,
    messages: [{ role: "user", content: prompt }]
  });
  return { provider: "anthropic", text: res.content[0].text };
}

async function sendCommand(command, payload = {}, meta = {}) {
  if (mode === "openai") return sendOpenAI(command, payload);
  if (mode === "anthropic") return sendAnthropic(command, payload);
  return sendSynthetic(command, payload, meta);
}

module.exports = { sendCommand };
