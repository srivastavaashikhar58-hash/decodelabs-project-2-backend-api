// ============================================================
// src/middleware/validateTask.js — Input validation middleware
// ============================================================
// WHY: We never trust user input. This middleware checks that
//      every new task has a valid title, description, and
//      status BEFORE the controller processes it.
// ============================================================

const ALLOWED_STATUSES = ['pending', 'in-progress', 'completed'];

function validateTask(req, res, next) {
  const { title, description, status } = req.body;
  const errors = [];

  // --- title ---
  if (title === undefined || title === null) {
    errors.push('Field "title" is required.');
  } else if (typeof title !== 'string' || title.trim().length === 0) {
    errors.push('"title" must be a non-empty string.');
  } else if (title.trim().length < 3) {
    errors.push('"title" must be at least 3 characters long.');
  } else if (title.trim().length > 100) {
    errors.push('"title" must be at most 100 characters long.');
  }

  // --- description ---
  if (description === undefined || description === null) {
    errors.push('Field "description" is required.');
  } else if (typeof description !== 'string' || description.trim().length === 0) {
    errors.push('"description" must be a non-empty string.');
  } else if (description.trim().length > 500) {
    errors.push('"description" must be at most 500 characters long.');
  }

  // --- status ---
  if (status === undefined || status === null) {
    errors.push('Field "status" is required.');
  } else if (!ALLOWED_STATUSES.includes(status)) {
    errors.push(
      `"status" must be one of: ${ALLOWED_STATUSES.join(', ')}. Received: "${status}".`
    );
  }

  // If any validation failed, respond with 400 Bad Request
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  // All checks passed — continue to the controller
  next();
}

module.exports = { validateTask, ALLOWED_STATUSES };
