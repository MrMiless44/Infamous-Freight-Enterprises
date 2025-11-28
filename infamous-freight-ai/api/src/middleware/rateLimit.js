const { RateLimiterMemory } = require("rate-limiter-flexible");

function rateLimit(options = {}) {
  const limiter = new RateLimiterMemory({
    points: options.points || 60,
    duration: options.duration || 60,
  });

  return async (req, res, next) => {
    const key = req.ip || "global";
    try {
      await limiter.consume(key);
      next();
    } catch {
      res.status(429).json({ error: "Too many requests" });
    }
  };
}

module.exports = rateLimit;
