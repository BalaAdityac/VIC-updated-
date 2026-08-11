class AppError extends Error {
  /**
   * @param {string} message - Human readable error message
   * @param {number} statusCode - HTTP status code
   * @param {any} [errors] - Optional array/object of field-level validation errors
   */
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
