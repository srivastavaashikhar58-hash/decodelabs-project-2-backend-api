// ============================================================
// src/middleware/errorHandler.js — Global error handler
// ============================================================
// WHY: If any route throws an error, this middleware catches
//      it and returns a clean JSON response instead of
//      crashing the server or leaking stack traces.
// ============================================================

function errorHandler(err, req, res, _next) {
  // Log the full error on the server for debugging
  console.error('❌  Unhandled error:', err.message);
  console.error(err.stack);

  // Send a safe response to the client
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: statusCode === 500
      ? 'Internal server error'   // hide details in production
      : err.message
  });
}

module.exports = { errorHandler };
