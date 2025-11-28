#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");

const endpoint =
  process.env.AI_AUTOREPAIR_ENDPOINT ||
  (process.env.AI_SYNTHETIC_ENGINE_URL
    ? process.env.AI_SYNTHETIC_ENGINE_URL.replace(
        "/internal/ai-sim",
        "/api/ai/repair/env"
      )
    : undefined);

const apiKey = process.env.AI_SYNTHETIC_API_KEY;
const securityMode = process.env.AI_SECURITY_MODE || "strict";

if (!endpoint) {
  console.error(
    "AI_AUTOREPAIR_ENDPOINT or AI_SYNTHETIC_ENGINE_URL must be set"
  );
  process.exit(1);
}

if (!apiKey) {
  console.error("AI_SYNTHETIC_API_KEY is required to call the repair endpoint");
  process.exit(1);
}

const envPath = path.resolve(process.argv[2] || ".env");
if (!fs.existsSync(envPath)) {
  console.error(`Env file not found at ${envPath}`);
  process.exit(1);
}

const envText = fs.readFileSync(envPath, "utf8");
const payload = JSON.stringify({
  envText,
  validationReport: {
    workflow: process.env.GITHUB_WORKFLOW || "local",
    runId: process.env.GITHUB_RUN_ID || Date.now().toString(),
  },
  tags: ["ci-auto-repair"],
});

const url = new URL(endpoint);
const options = {
  method: "POST",
  hostname: url.hostname,
  port: url.port || (url.protocol === "https:" ? 443 : 80),
  path: url.pathname + url.search,
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
    "x-api-key": apiKey,
    "x-security-mode": securityMode,
    "User-Agent": "infamous-ci-auto-repair",
  },
};

const transport = url.protocol === "https:" ? https : http;

const req = transport.request(options, (res) => {
  let body = "";
  res.on("data", (chunk) => {
    body += chunk;
  });
  res.on("end", () => {
    console.log(`AI repair status: ${res.statusCode}`);
    if (body) {
      console.log(body);
    }
    if (res.statusCode >= 400) {
      process.exit(1);
    }
  });
});

req.on("error", (err) => {
  console.error("AI auto-repair request failed", err);
  process.exit(1);
});

req.write(payload);
req.end();
