const bcrypt = require("bcrypt");
const env = require("../config/env");

/**
 * Hashes a plaintext password with bcrypt.
 * @param {string} plainPassword
 */
async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, env.BCRYPT_SALT_ROUNDS);
}

/**
 * Compares a plaintext password against a bcrypt hash.
 * @param {string} plainPassword
 * @param {string} hashedPassword
 */
async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = { hashPassword, comparePassword };
