/**
 * Sends a consistent success response shape across every endpoint.
 * { success: true, message, data }
 */
function sendSuccess(res, { statusCode = 200, message = "Request successful", data = null } = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Sends a consistent error response shape across every endpoint.
 * { success: false, message, errors }
 * Normally called internally by the global error handler, but exported
 * in case a controller needs to short-circuit with a custom error shape.
 */
function sendError(res, { statusCode = 500, message = "Something went wrong", errors = null } = {}) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

module.exports = { sendSuccess, sendError };
