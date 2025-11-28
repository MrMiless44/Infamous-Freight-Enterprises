require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const healthRoutes = require("./routes/health");
const aiRoutes = require("./routes/ai.commands");
const aiMaintenanceRoutes = require("./routes/ai.maintenance");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

app.use("/api", healthRoutes);
app.use("/api", aiRoutes);
app.use("/api", aiMaintenanceRoutes);

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
app.listen(port, () => {
  console.log(`Infæmous Freight API listening on ${port}`);
});
