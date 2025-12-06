require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const { RateLimiterMemory } = require("rate-limiter-flexible");
const healthRoutes = require("./routes/health");
const aiRoutes = require("./routes/ai.commands");
const aiMaintenanceRoutes = require("./routes/ai.maintenance");
const billingRoutes = require("./routes/billing");
const paymentsRoutes = require("./routes/payments");

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = (process.env.CORS_ORIGINS || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions =
  allowedOrigins.includes("*") || allowedOrigins.length === 0
    ? {}
    : { origin: allowedOrigins, optionsSuccessStatus: 200 };

const rateLimiter = new RateLimiterMemory({ points: 100, duration: 60 });
const rateLimiterMiddleware = (req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => next())
    .catch(() => res.status(429).send("Too Many Requests"));
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("combined"));
app.use(rateLimiterMiddleware);

app.use("/api", healthRoutes);
app.use("/api", aiRoutes);
app.use("/api", aiMaintenanceRoutes);
app.use("/api", billingRoutes);
app.use("/api", paymentsRoutes);

app.post("/internal/ai-sim", (req, res) => {
  const { command, payload, meta } = req.body || {};
  const reply = {
    echoCommand: command,
    message: "Synthetic AI simulation",
    suggestedAction: "This would route or optimize logistics",
    payload,
    meta,
  };
  res.json(reply);
});

const port = process.env.PORT || 4000;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Infæmous Freight API listening on ${port}`);
  });
}

module.exports = app;
