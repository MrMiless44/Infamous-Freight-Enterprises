function audit(req, res, next) {
  const start = Date.now();
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    const ms = Date.now() - start;
    const entry = {
      ts: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: ms,
      authMode: req.auth?.mode,
      subject: req.auth?.subject,
    };
    console.log("AUDIT", JSON.stringify(entry));
    return originalJson(body);
  };

  next();
}

module.exports = audit;
