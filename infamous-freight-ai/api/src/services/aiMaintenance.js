const fs = require("fs");
const path = require("path");

// This function reads the .env.example file to get a list of required environment variables.
function getRequiredEnvKeys() {
  const envExamplePath = path.resolve(__dirname, "../../../../.env.example");
  try {
    const content = fs.readFileSync(envExamplePath, "utf-8");
    const lines = content.split("\n");
    const keys = lines
      .map(line => line.split("=")[0])
      .filter(key => key && !key.startsWith("#"));
    return keys;
  } catch (error) {
    console.error("Could not read .env.example file:", error);
    return [];
  }
}

// This function validates the current environment against the required keys.
function validateEnvironment() {
  const requiredKeys = getRequiredEnvKeys();
  const missing = [];
  const present = [];

  for (const key of requiredKeys) {
    if (!process.env[key] || process.env[key].trim() === "") {
      missing.push(key);
    } else {
      present.push(key);
    }
  }

  const isValid = missing.length === 0;

  return {
    isValid,
    required: requiredKeys.length,
    present: present.length,
    missing: missing.length,
    presentKeys: present,
    missingKeys: missing,
    checkedAt: new Date().toISOString(),
  };
}

module.exports = { validateEnvironment, getRequiredEnvKeys };