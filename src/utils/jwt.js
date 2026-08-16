const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");
module.exports = {
  signToken: (u) => jwt.sign({ id: u.id, role: u.role, email: u.email }, JWT_SECRET, { expiresIn: "1d" }),
  verifyToken: (t) => jwt.verify(t, JWT_SECRET)
};
