const dotenv = require("dotenv");
dotenv.config();

const required = [
  "DATABASE_URL",
  "PORT",
  "JWT_SECRET",
  "AI_SYNTHETIC_ENGINE_URL",
  "AI_SYNTHETIC_API_KEY",
  "AI_SECURITY_MODE",
];

const missing = required.filter(
  (k) => !process.env[k] || process.env[k].trim() === ""
);

if (missing.length > 0) {
  console.error("Environment validation failed. Missing:");
  missing.forEach((k) => console.error(" - " + k));
  process.exit(1);
} else {
  console.log("Environment validation passed.");
}
