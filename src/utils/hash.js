const bcrypt = require("bcrypt");
module.exports = {
  hashPassword: (p) => bcrypt.hash(p, 10),
  comparePassword: (p, h) => bcrypt.compare(p, h)
};
