// ============================================================
// src/middleware/logger.js — Request logger
// ============================================================
// WHY: Logging every request helps us debug problems and
//      see exactly which endpoints are being called.
// ============================================================

function requestLogger(req, res, next) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}]  ${req.method}  ${req.originalUrl}`);
  next(); // pass control to the next middleware / route
}

module.exports = { requestLogger };
