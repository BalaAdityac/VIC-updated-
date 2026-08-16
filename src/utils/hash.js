const bcrypt = require("bcryptjs");
module.exports = {
  hashPassword: (p) => bcrypt.hash(p, 10),
  comparePassword: (p, h) => bcrypt.compare(p, h)
};
