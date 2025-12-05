#!/usr/bin/env node

const healthUrl = process.env.HEALTH_URL || "http://localhost/api/health";

(async () => {
  try {
    const res = await fetch(healthUrl);
    if (!res.ok) {
      throw new Error(`Unexpected status ${res.status}`);
    }

    const json = await res.json();
    if (!json.ok) {
      throw new Error(`Health endpoint returned: ${JSON.stringify(json)}`);
    }

    console.log("✅ Health smoke test passed", json);
  } catch (error) {
    console.error("Health smoke test failed:", error);
    process.exit(1);
  }
})();