const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { verifyAccessToken } = require("../utils/jwt.util");
const prisma = require("../config/prisma");

/**
 * Protects private routes:
 * 1. Reads the "Authorization: Bearer <token>" header
 * 2. Verifies the JWT signature/expiry
 * 3. Confirms the user referenced by the token still exists and is active
 * 4. Attaches { id, email, role, status } to req.user for downstream handlers
 */
const authenticate = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Authentication token missing. Please log in.", 401);
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new AppError("Session expired. Please log in again.", 401);
    }
    throw new AppError("Invalid authentication token.", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, email: true, role: true, status: true },
  });

  if (!user) {
    throw new AppError("The user belonging to this token no longer exists.", 401);
  }

  if (user.status !== "Active") {
    throw new AppError(`Your account is ${user.status.toLowerCase()}. Contact support.`, 403);
  }

  req.user = user;
  next();
});

module.exports = authenticate;
