const express = require("express");
const router = express.Router();
const authHybrid = require("../middleware/auth.hybrid");
const scopeGuard = require("../middleware/scopeGuard");
const { validateEnvironment } = require("../services/aiMaintenance");

const ADMIN_SCOPES = ["system:admin"];

router.post(
  "/ai/maintenance/validate-env",
  authHybrid,
  scopeGuard(ADMIN_SCOPES),
  (req, res) => {
    const validationResult = validateEnvironment();
    if (validationResult.isValid) {
      res.json({
        ok: true,
        message: "Environment validation passed.",
        report: validationResult,
      });
    } else {
      res.status(500).json({
        ok: false,
        error: "Environment validation failed.",
        report: validationResult,
      });
    }
  }
);

module.exports = router;