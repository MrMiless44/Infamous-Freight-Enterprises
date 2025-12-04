require("dotenv").config();

const required = [
  "DATABASE_URL",
  "JWT_SECRET"
];

const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error("❌ Missing required environment variables:");
  missing.forEach(key => console.error(`   - ${key}`));
  process.exit(1);
}

console.log("✅ Environment validation passed");
