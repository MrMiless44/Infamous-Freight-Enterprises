require("dotenv").config();

const required = [
  "DATABASE_URL",
  "JWT_SECRET"
];

const provider = process.env.AI_PROVIDER || "synthetic";

if (provider === "openai") {
  required.push("OPENAI_API_KEY");
} else if (provider === "anthropic") {
  required.push("ANTHROPIC_API_KEY");
} else {
  required.push("AI_SYNTHETIC_ENGINE_URL", "AI_SYNTHETIC_API_KEY");
}

const stripeConfigured =
  process.env.STRIPE_SECRET_KEY ||
  process.env.STRIPE_SUCCESS_URL ||
  process.env.STRIPE_CANCEL_URL;
if (stripeConfigured) {
  required.push("STRIPE_SECRET_KEY", "STRIPE_SUCCESS_URL", "STRIPE_CANCEL_URL");
}

const paypalConfigured = process.env.PAYPAL_CLIENT_ID || process.env.PAYPAL_SECRET;
if (paypalConfigured) {
  required.push("PAYPAL_CLIENT_ID", "PAYPAL_SECRET");
}

const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error("❌ Missing required environment variables:");
  missing.forEach(key => console.error(`   - ${key}`));
  process.exit(1);
}

console.log("✅ Environment validation passed");
