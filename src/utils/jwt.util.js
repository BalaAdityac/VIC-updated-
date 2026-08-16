const jwt = require("jsonwebtoken");
const env = require("../config/env");

/**
 * Signs a JWT access token embedding the user's id and role.
 * @param {{ id: string, role: string }} payload
 */
function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

/**
 * Verifies a JWT access token. Throws if invalid/expired.
 * @param {string} token
 */
function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

module.exports = { signAccessToken, verifyAccessToken };
