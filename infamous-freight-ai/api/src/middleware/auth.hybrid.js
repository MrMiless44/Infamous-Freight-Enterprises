const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

function authHybrid(req, res, next) {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers["x-api-key"];

  if (apiKey && apiKey === process.env.AI_SYNTHETIC_API_KEY) {
    req.auth = {
      mode: "api-key",
      scopes: ["ai:query", "data:read", "system:admin", "ai:repair"],
      subject: "ai-synthetic-engine",
    };
    return next();
  }

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.auth = {
        mode: "jwt",
        subject: decoded.sub || decoded.id,
        scopes: decoded.scopes || ["user:basic"],
      };
      return next();
    } catch (e) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  }

  return res.status(401).json({ error: "Unauthorized" });
}

module.exports = authHybrid;
