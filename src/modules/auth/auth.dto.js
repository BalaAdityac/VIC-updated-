/**
 * Strips sensitive fields (password) before sending a user object back
 * to the client. Every response that includes a user MUST go through this.
 */
function toUserDTO(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

module.exports = { toUserDTO };
