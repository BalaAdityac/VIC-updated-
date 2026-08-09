const AppError = require("../../utils/AppError");
const { hashPassword, comparePassword } = require("../../utils/hash.util");
const { signAccessToken } = require("../../utils/jwt.util");
const authRepository = require("./auth.repository");
const { toUserDTO } = require("./auth.dto");

/**
 * Registers a new user. Email must be unique; password is hashed with
 * bcrypt before it is ever written to the database.
 */
async function register({ email, password, role }) {
  const existingUser = await authRepository.findByEmail(email);
  if (existingUser) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const hashedPassword = await hashPassword(password);
  const user = await authRepository.createUser({ email, password: hashedPassword, role });

  const token = signAccessToken({ id: user.id, role: user.role });

  return { user: toUserDTO(user), token };
}

/**
 * Authenticates a user by email/password and issues a signed JWT.
 * Uses a generic error message on failure so we never reveal whether
 * the email or the password was the one that was wrong.
 */
async function login({ email, password }) {
  const user = await authRepository.findByEmail(email);
  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (user.status !== "Active") {
    throw new AppError(`Your account is ${user.status.toLowerCase()}. Contact support.`, 403);
  }

  const token = signAccessToken({ id: user.id, role: user.role });

  return { user: toUserDTO(user), token };
}

/**
 * Returns the currently authenticated user's full profile.
 */
async function getCurrentUser(userId) {
  const user = await authRepository.findById(userId);
  if (!user) {
    throw new AppError("User not found.", 404);
  }
  return toUserDTO(user);
}

/**
 * Updates the logged-in user's password after re-verifying their
 * current password.
 */
async function updatePassword(userId, { currentPassword, newPassword }) {
  const user = await authRepository.findById(userId);
  if (!user) {
    throw new AppError("User not found.", 404);
  }

  const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw new AppError("Current password is incorrect.", 401);
  }

  const hashedPassword = await hashPassword(newPassword);
  const updatedUser = await authRepository.updatePassword(userId, hashedPassword);

  return toUserDTO(updatedUser);
}

/**
 * Forgot Password — structure only, as scoped for this module.
 * Always responds with a generic success message (even if the email
 * doesn't exist) to avoid leaking which emails are registered.
 * TODO: integrate an email/SMS provider, generate a short-lived reset
 * token or OTP, persist it, and send it to the user.
 */
async function forgotPassword(email) {
  const user = await authRepository.findByEmail(email);

  if (user) {
    // TODO: generate reset token/OTP, save with an expiry, and email it.
    // eslint-disable-next-line no-console
    console.log(`[forgotPassword] Reset flow triggered for ${email} (structure only — no email sent yet).`);
  }

  return {
    message: "If an account with that email exists, password reset instructions have been sent.",
  };
}

/**
 * Logout — with a stateless JWT there is nothing to invalidate server-side
 * by default (the client simply discards the token). This function is the
 * documented extension point for a token-blacklist or refresh-token store
 * (e.g. Redis) should that be added later.
 */
async function logout(/* userId, token */) {
  // TODO: if a token blacklist/refresh-token store is introduced,
  // invalidate the given token or refresh-token record here.
  return { message: "Logged out successfully." };
}

module.exports = {
  register,
  login,
  getCurrentUser,
  updatePassword,
  forgotPassword,
  logout,
};
