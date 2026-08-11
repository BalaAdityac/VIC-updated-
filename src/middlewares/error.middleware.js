const { ZodError } = require("zod");
const { Prisma } = require("@prisma/client");
const AppError = require("../utils/AppError");
const env = require("../config/env");

/**
 * Converts known error types (Zod validation, Prisma, JWT, custom AppError)
 * into a normalized { statusCode, message, errors } shape.
 */
function normalizeError(err) {
  // Zod validation errors
  if (err instanceof ZodError) {
    return {
      statusCode: 422,
      message: "Validation failed",
      errors: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    };
  }

  // Prisma known request errors (unique constraint, not found, etc.)
  if (Prisma?.PrismaClientKnownRequestError && err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return {
        statusCode: 409,
        message: `A record with this ${err.meta?.target?.join(", ") || "value"} already exists.`,
        errors: null,
      };
    }
    if (err.code === "P2025") {
      return { statusCode: 404, message: "Record not found.", errors: null };
    }
    return { statusCode: 400, message: "Database request error.", errors: null };
  }

  // JWT errors that slip through without going via AppError
  if (err.name === "JsonWebTokenError") {
    return { statusCode: 401, message: "Invalid authentication token.", errors: null };
  }
  if (err.name === "TokenExpiredError") {
    return { statusCode: 401, message: "Session expired. Please log in again.", errors: null };
  }

  // Our own operational errors
  if (err instanceof AppError) {
    return { statusCode: err.statusCode, message: err.message, errors: err.errors };
  }

  // Fallback: unexpected / programming errors
  return {
    statusCode: 500,
    message: env.NODE_ENV === "production" ? "Internal server error." : err.message,
    errors: null,
  };
}

// eslint-disable-next-line no-unused-vars
function globalErrorHandler(err, req, res, next) {
  const { statusCode, message, errors } = normalizeError(err);

  if (statusCode === 500) {
    // eslint-disable-next-line no-console
    console.error("[UNEXPECTED ERROR]", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(env.NODE_ENV === "development" && statusCode === 500 ? { stack: err.stack } : {}),
  });
}

module.exports = globalErrorHandler;
