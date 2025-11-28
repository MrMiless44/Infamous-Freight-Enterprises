module.exports = function scopeGuard(requiredScopes) {
  if (!Array.isArray(requiredScopes)) {
    throw new Error("scopeGuard expects an array of scopes");
  }

  return (req, res, next) => {
    const current = req.auth?.scopes || [];
    const ok = requiredScopes.every((s) => current.includes(s));
    if (!ok) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Insufficient scopes",
        required: requiredScopes,
        current,
      });
    }
    next();
  };
};
